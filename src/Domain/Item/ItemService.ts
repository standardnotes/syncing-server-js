import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { Time, TimerInterface } from '@standardnotes/time'
import * as crypto from 'crypto'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { AuthHttpServiceInterface } from '../Auth/AuthHttpServiceInterface'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { RevisionServiceInterface } from '../Revision/RevisionServiceInterface'
import { ServiceTransitionHelperInterface } from '../Transition/ServiceTransitionHelperInterface'
import { ContentType } from './ContentType'
import { GetItemsDTO } from './GetItemsDTO'

import { GetItemsResult } from './GetItemsResult'
import { Item } from './Item'
import { ItemConflict } from './ItemConflict'
import { ItemFactoryInterface } from './ItemFactoryInterface'
import { ItemHash } from './ItemHash'
import { ItemQuery } from './ItemQuery'
import { ItemRepositoryInterface } from './ItemRepositoryInterface'
import { ItemServiceInterface } from './ItemServiceInterface'
import { SaveItemsDTO } from './SaveItemsDTO'
import { SaveItemsResult } from './SaveItemsResult'
import { ItemSaveValidatorInterface } from './SaveValidator/ItemSaveValidatorInterface'

@injectable()
export class ItemService implements ItemServiceInterface {
  private readonly DEFAULT_ITEMS_LIMIT = 100000
  private readonly SYNC_TOKEN_VERSION = 2

  constructor (
    @inject(TYPES.ItemSaveValidator) private itemSaveValidator: ItemSaveValidatorInterface,
    @inject(TYPES.ServiceTransitionHelper) private serviceTransitionHelper: ServiceTransitionHelperInterface,
    @inject(TYPES.AuthHttpService) private authHttpService: AuthHttpServiceInterface,
    @inject(TYPES.ItemFactory) private itemFactory: ItemFactoryInterface,
    @inject(TYPES.ItemRepository) private itemRepository: ItemRepositoryInterface,
    @inject(TYPES.RevisionService) private revisionService: RevisionServiceInterface,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.REVISIONS_FREQUENCY) private revisionFrequency: number,
    @inject(TYPES.Timer) private timer: TimerInterface,
    @inject(TYPES.Logger) private logger: Logger
  ) {
  }

  async computeIntegrityHash(userUuid: string): Promise<string> {
    const timestampsInMicroseconds = await this.itemRepository.findDatesForComputingIntegrityHash(userUuid)

    const timestampsInMilliseconds = timestampsInMicroseconds.map(timestampInMicroseconds => this.timer.convertMicrosecondsToMilliseconds(timestampInMicroseconds))

    const mfaFromUserSettings = await this.serviceTransitionHelper.userHasMovedMFAToUserSettings(userUuid)
    if (mfaFromUserSettings.status === 'active') {
      const timestamp = await this.serviceTransitionHelper.getUserMFAUpdatedAtTimestamp(userUuid)
      timestampsInMilliseconds.unshift(this.timer.convertMicrosecondsToMilliseconds(timestamp))
      timestampsInMilliseconds.sort().reverse()
    }

    const stringToHash = timestampsInMilliseconds.join(',')

    return crypto.createHash('sha256').update(stringToHash).digest('hex')
  }

  async getItems(dto: GetItemsDTO): Promise<GetItemsResult> {
    const lastSyncTime = this.getLastSyncTime(dto)
    const syncTimeComparison = dto.cursorToken ? '>=' : '>'

    const itemQuery: ItemQuery = {
      userUuid: dto.userUuid,
      lastSyncTime,
      syncTimeComparison,
      contentType: dto.contentType,
      deleted: lastSyncTime ? undefined : false,
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
    }

    let items = await this.itemRepository.findAll(itemQuery)

    const userHasMovedMFAToUserSettings = await this.serviceTransitionHelper.userHasMovedMFAToUserSettings(dto.userUuid)

    const mfaIsToBeRetrieved = dto.contentType === undefined || dto.contentType === ContentType.MFA

    this.logger.debug(`user has mfa in user settings: ${userHasMovedMFAToUserSettings.status !== 'not found'}, mfa to be retrieved: ${mfaIsToBeRetrieved}`)

    if (mfaIsToBeRetrieved && userHasMovedMFAToUserSettings.status !== 'not found') {
      items = await this.appendStubMFAItemBasedOnSyncToken({
        userUuid: dto.userUuid,
        items,
        lastSyncTime,
        syncTimeComparison,
        mfaUserSettingStatusDeleted: userHasMovedMFAToUserSettings.status === 'deleted',
      })
    }

    let cursorToken = undefined
    const limit = dto.limit === undefined || dto.limit < 1 ? this.DEFAULT_ITEMS_LIMIT : dto.limit
    if (items.length > limit) {
      items = items.slice(0, limit)
      const lastSyncTime = (items[items.length - 1].updatedAtTimestamp) / Time.MicrosecondsInASecond
      cursorToken = Buffer.from(`${this.SYNC_TOKEN_VERSION}:${lastSyncTime}`, 'utf-8').toString('base64')
    }

    return {
      items,
      cursorToken,
    }
  }

  async saveItems(dto: SaveItemsDTO): Promise<SaveItemsResult> {
    const savedItems: Array<Item> = []
    const conflicts: Array<ItemConflict> = []

    const lastUpdatedTimestamp = this.timer.getTimestampInMicroseconds()

    for (const itemHash of dto.itemHashes) {
      const existingItem = await this.itemRepository.findByUuid(itemHash.uuid)
      const processingResult = await this.itemSaveValidator.validate({
        userUuid: dto.userUuid,
        apiVersion: dto.apiVersion,
        itemHash,
        existingItem,
      })
      if (!processingResult.passed) {
        this.logger.debug('Item %s filtered out from saving: %O', itemHash.uuid, processingResult)

        if (processingResult.conflict) {
          conflicts.push(processingResult.conflict)
        }
        if (processingResult.skipped) {
          savedItems.push(processingResult.skipped)
        }

        continue
      }

      if(existingItem) {
        this.logger.debug(`Updating existing item ${existingItem.uuid}`)

        const updatedItem = await this.updateExistingItem(existingItem, itemHash, dto.userAgent)
        savedItems.push(updatedItem)
      } else {
        this.logger.debug(`Saving new item ${itemHash.uuid}`)

        try {
          const newItem = await this.saveNewItem(dto.userUuid, itemHash, dto.userAgent)
          savedItems.push(newItem)
        } catch (error) {
          this.logger.error(`Saving item ${itemHash.uuid} failed. Error: ${error.message}`)

          conflicts.push({
            unsavedItem: itemHash,
            type: 'uuid_conflict',
          })

          continue
        }
      }
    }

    const syncToken = this.calculateSyncToken(lastUpdatedTimestamp, savedItems)

    return {
      savedItems,
      conflicts,
      syncToken,
    }
  }

  async frontLoadKeysItemsToTop(userUuid: string, retrievedItems: Array<Item>): Promise<Array<Item>> {
    const itemsKeys = await this.itemRepository.findAll({
      userUuid,
      contentType: ContentType.ItemsKey,
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
    })

    const retrievedItemsIds: Array<string> = retrievedItems.map((item: Item) => item.uuid)

    itemsKeys.forEach((itemKey: Item) => {
      if(retrievedItemsIds.indexOf(itemKey.uuid) === -1) {
        retrievedItems.unshift(itemKey)
      }
    })

    return retrievedItems
  }

  private calculateSyncToken(lastUpdatedTimestamp: number, savedItems: Array<Item>): string {
    if (savedItems.length) {
      const sortedItems = savedItems.sort((itemA: Item, itemB: Item) => itemA.updatedAtTimestamp > itemB.updatedAtTimestamp ? 1 : -1)
      lastUpdatedTimestamp = sortedItems[sortedItems.length - 1].updatedAtTimestamp
    }

    const lastUpdatedTimestampWithMicrosecondPreventingSyncDoubles = lastUpdatedTimestamp + 1

    return Buffer.from(
      `${this.SYNC_TOKEN_VERSION}:${lastUpdatedTimestampWithMicrosecondPreventingSyncDoubles / Time.MicrosecondsInASecond}`,
      'utf-8'
    ).toString('base64')
  }

  private async updateExistingItem(existingItem: Item, itemHash: ItemHash, userAgent?: string): Promise<Item> {
    if (itemHash.content) {
      existingItem.content = itemHash.content
    }
    if (itemHash.content_type) {
      existingItem.contentType = itemHash.content_type
    }
    if (itemHash.deleted !== undefined) {
      existingItem.deleted = itemHash.deleted
    }
    let wasMarkedAsDuplicate = false
    if (itemHash.duplicate_of) {
      wasMarkedAsDuplicate = !existingItem.duplicateOf
      existingItem.duplicateOf = itemHash.duplicate_of
    }
    if (itemHash.auth_hash) {
      existingItem.authHash = itemHash.auth_hash
    }
    if (itemHash.enc_item_key) {
      existingItem.encItemKey = itemHash.enc_item_key
    }
    if (itemHash.items_key_id) {
      existingItem.itemsKeyId = itemHash.items_key_id
    }
    existingItem.lastUserAgent = userAgent ?? null

    if (itemHash.deleted === true) {
      existingItem.deleted = true
      existingItem.content = null
      existingItem.encItemKey = null
      existingItem.authHash = null
    }

    const updatedAt = this.timer.getTimestampInMicroseconds()
    const secondsFromLastUpdate = this.timer.convertMicrosecondsToSeconds(updatedAt - existingItem.updatedAtTimestamp)

    if (itemHash.created_at_timestamp) {
      existingItem.createdAtTimestamp = itemHash.created_at_timestamp
      existingItem.createdAt = this.timer.convertMicrosecondsToDate(itemHash.created_at_timestamp)
    } else if (itemHash.created_at) {
      existingItem.createdAtTimestamp = this.timer.convertStringDateToMicroseconds(itemHash.created_at)
      existingItem.createdAt = this.timer.convertStringDateToDate(itemHash.created_at)
    }

    existingItem.updatedAtTimestamp = updatedAt
    existingItem.updatedAt = this.timer.convertMicrosecondsToDate(updatedAt)

    const savedItem = await this.itemRepository.save(existingItem)

    if (secondsFromLastUpdate >= this.revisionFrequency) {
      await this.revisionService.createRevision(savedItem)
    }

    if (wasMarkedAsDuplicate) {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createDuplicateItemSyncedEvent(savedItem.uuid, savedItem.userUuid)
      )
    }

    return savedItem
  }

  private async saveNewItem(userUuid: string, itemHash: ItemHash, userAgent?: string): Promise<Item> {
    const newItem = this.itemFactory.create(userUuid, itemHash, userAgent)

    const savedItem = await this.itemRepository.save(newItem)

    await this.revisionService.createRevision(savedItem)

    if (savedItem.duplicateOf) {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createDuplicateItemSyncedEvent(savedItem.uuid, savedItem.userUuid)
      )
    }

    return savedItem
  }

  private getLastSyncTime(dto: GetItemsDTO): number | undefined {
    let token = dto.syncToken
    if (dto.cursorToken !== undefined && dto.cursorToken !== null) {
      token = dto.cursorToken
    }

    if (!token) {
      return undefined
    }

    const decodedToken = Buffer.from(token, 'base64').toString('utf-8')

    const tokenParts = decodedToken.split(':')
    const version = tokenParts.shift()

    switch(version) {
    case '1':
      return this.timer.convertStringDateToMicroseconds(tokenParts.join(':'))
    case '2':
      return +tokenParts[0] * Time.MicrosecondsInASecond
    default:
      throw Error('Sync token is missing version part')
    }
  }

  private async appendStubMFAItemBasedOnSyncToken(dto: {
    userUuid: string,
    items: Array<Item>,
    lastSyncTime: number | undefined,
    syncTimeComparison: '>' | '>='
    mfaUserSettingStatusDeleted: boolean
  }): Promise<Array<Item>> {
    const mfaUserSettingUpdatedAt = await this.serviceTransitionHelper.getUserMFAUpdatedAtTimestamp(dto.userUuid)

    this.logger.debug(`MFA user setting update at: ${mfaUserSettingUpdatedAt}`)

    const shouldMfaUserSettingBeAppendedBasedOnStatus = !dto.mfaUserSettingStatusDeleted || dto.lastSyncTime !== undefined
    const shouldMfaUserSettingBeAppendedBasedOnLastSyncTime =
      dto.lastSyncTime === undefined ||
      dto.syncTimeComparison === '>' && mfaUserSettingUpdatedAt > dto.lastSyncTime ||
      dto.syncTimeComparison === '>=' && mfaUserSettingUpdatedAt >= dto.lastSyncTime

    this.logger.debug(`MFA should be appeneded based on status: ${shouldMfaUserSettingBeAppendedBasedOnStatus}, based on syncTime (${dto.lastSyncTime}): ${shouldMfaUserSettingBeAppendedBasedOnLastSyncTime}`)

    const mfaUserSettingShouldBeAppendedToItemsBatch =
      shouldMfaUserSettingBeAppendedBasedOnStatus &&
      shouldMfaUserSettingBeAppendedBasedOnLastSyncTime

    if (mfaUserSettingShouldBeAppendedToItemsBatch) {
      const mfaUserSetting = await this.authHttpService.getUserMFA(dto.userUuid)

      const stubItem = this.itemFactory.createStub(dto.userUuid, {
        uuid: mfaUserSetting.uuid,
        content_type: ContentType.MFA,
        content: mfaUserSetting.value ?? undefined,
        deleted: dto.mfaUserSettingStatusDeleted,
        created_at_timestamp: mfaUserSetting.createdAt,
        updated_at_timestamp: mfaUserSetting.updatedAt,
      })

      dto.items.unshift(stubItem)
    }

    return dto.items
  }
}
