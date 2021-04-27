import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import * as crypto from 'crypto'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { ApiVersion } from '../Api/ApiVersion'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { RevisionServiceInterface } from '../Revision/RevisionServiceInterface'
import { Time } from '../Time/Time'
import { TimerInterface } from '../Time/TimerInterface'
import { ContentType } from './ContentType'
import { GetItemsDTO } from './GetItemsDTO'

import { GetItemsResult } from './GetItemsResult'
import { Item } from './Item'
import { ItemConflict } from './ItemConflict'
import { ItemHash } from './ItemHash'
import { ItemQuery } from './ItemQuery'
import { ItemRepositoryInterface } from './ItemRepositoryInterface'
import { ItemServiceInterface } from './ItemServiceInterface'
import { SaveItemsDTO } from './SaveItemsDTO'
import { SaveItemsResult } from './SaveItemsResult'

@injectable()
export class ItemService implements ItemServiceInterface {
  private readonly DEFAULT_ITEMS_LIMIT = 100000
  private readonly SYNC_TOKEN_VERSION = 2

  constructor (
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

    const stringToHash = timestampsInMilliseconds.join(',')

    return crypto.createHash('sha256').update(stringToHash).digest('hex')
  }

  async getItems(dto: GetItemsDTO): Promise<GetItemsResult> {
    const lastSyncTime = this.getLastSyncTime(dto)

    const itemQuery: ItemQuery = {
      userUuid: dto.userUuid,
      lastSyncTime,
      syncTimeComparison: dto.cursorToken ? '>=' : '>',
      contentType: dto.contentType,
      deleted: lastSyncTime ? undefined : false,
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
    }

    let items = await this.itemRepository.findAll(itemQuery)

    this.logger.debug(`Fetched ${items.length} items. Limit defined: ${dto.limit}`)

    let cursorToken = undefined
    const limit = dto.limit === undefined || dto.limit < 1 ? this.DEFAULT_ITEMS_LIMIT : dto.limit
    if (items.length > limit) {
      items = items.slice(0, limit)
      const lastSyncTime = (items[items.length - 1].updatedAt) / Time.MicrosecondsInASecond
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
      if (this.itemBelongsToADifferentUser(dto.userUuid, existingItem)) {
        conflicts.push({
          unsavedItem: itemHash,
          type: 'uuid_conflict',
        })

        continue
      }

      if (!this.itemShouldBeSaved(itemHash, dto.apiVersion, existingItem)) {
        this.logger.debug(`Item ${itemHash.uuid} should not be saved. Sync conflict.`)

        conflicts.push({
          serverItem: existingItem,
          type: 'sync_conflict',
        })

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
          this.logger.debug(`Item ${itemHash.uuid} should not be saved. Conflict: ${error.message}`)

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
      const sortedItems = savedItems.sort((itemA: Item, itemB: Item) => itemA.updatedAt > itemB.updatedAt ? 1 : -1)
      lastUpdatedTimestamp = sortedItems[sortedItems.length - 1].updatedAt
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
    const secondsFromLastUpdate = this.timer.convertMicrosecondsToSeconds(updatedAt - existingItem.updatedAt)

    existingItem.updatedAt = updatedAt

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
    const newItem = new Item()
    newItem.uuid = itemHash.uuid
    if (itemHash.content) {
      newItem.content = itemHash.content
    }
    newItem.userUuid = userUuid
    if (itemHash.content_type) {
      newItem.contentType = itemHash.content_type
    }
    if (itemHash.enc_item_key) {
      newItem.encItemKey = itemHash.enc_item_key
    }
    if (itemHash.items_key_id) {
      newItem.itemsKeyId = itemHash.items_key_id
    }
    if (itemHash.duplicate_of) {
      newItem.duplicateOf = itemHash.duplicate_of
    }
    if (itemHash.deleted !== undefined) {
      newItem.deleted = itemHash.deleted
    }
    if (itemHash.auth_hash) {
      newItem.authHash = itemHash.auth_hash
    }
    newItem.lastUserAgent = userAgent ?? null
    const now = this.timer.getTimestampInMicroseconds()
    newItem.createdAt = now
    newItem.updatedAt = now

    const savedItem = await this.itemRepository.save(newItem)

    await this.revisionService.createRevision(savedItem)

    if (savedItem.duplicateOf) {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createDuplicateItemSyncedEvent(savedItem.uuid, savedItem.userUuid)
      )
    }

    return savedItem
  }

  private itemBelongsToADifferentUser(userUuid: string, existingItem?: Item) {
    return existingItem !== undefined && existingItem.userUuid !== userUuid
  }

  private itemShouldBeSaved(itemHash: ItemHash, apiVersion?: string, existingItem?: Item): boolean {
    if (!existingItem) {
      this.logger.debug(`No previously existing item with uuid ${itemHash.uuid} . Item should be saved`)

      return true
    }

    const incomingUpdatedAtTimestamp = itemHash.updated_at ?
      this.timer.convertStringDateToMicroseconds(itemHash.updated_at) :
      this.timer.convertStringDateToMicroseconds(new Date(0).toString())

    this.logger.debug(`Incoming updated at timestamp for item ${itemHash.uuid}: ${incomingUpdatedAtTimestamp}`)

    const ourUpdatedAtTimestamp = existingItem.updatedAt

    this.logger.debug(`Our updated at timestamp for item ${itemHash.uuid}: ${ourUpdatedAtTimestamp}`)

    const difference = incomingUpdatedAtTimestamp - ourUpdatedAtTimestamp

    this.logger.debug(`Difference in timestamps for item ${itemHash.uuid}: ${Math.abs(difference)}`)

    return Math.abs(difference) < this.getMinimalConflictIntervalMicroseconds(apiVersion)
  }

  private getMinimalConflictIntervalMicroseconds(apiVersion?: string): number {
    switch(apiVersion) {
    case ApiVersion.v20161215:
      return Time.MicrosecondsInASecond
    default:
      return Time.MicrosecondsInAMillisecond
    }
  }

  private getLastSyncTime(dto: GetItemsDTO): number | undefined {
    let token = dto.syncToken
    if (dto.cursorToken !== undefined) {
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
}
