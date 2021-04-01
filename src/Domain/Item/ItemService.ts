import * as crypto from 'crypto'
import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { ApiVersion } from '../Api/ApiVersion'
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
    @inject(TYPES.Timer) private timer: TimerInterface
  ) {
  }

  async computeIntegrityHash(userUuid: string): Promise<string> {
    const timestampsInMicroseconds = await this.itemRepository.findDatesForComputingIntegrityHash(userUuid)

    const timestampsInMilliseconds = timestampsInMicroseconds.map(timestampsInMicroseconds => Math.floor(timestampsInMicroseconds / Time.MicrosecondsInAMillisecond))

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
      sortOrder: 'DESC'
    }

    let items = await this.itemRepository.findAll(itemQuery)

    let cursorToken = undefined
    const limit = !dto.limit || dto.limit < 1 ? this.DEFAULT_ITEMS_LIMIT : dto.limit
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
      const existingItem = await this.itemRepository.findByUuidAndUserUuid(itemHash.uuid, dto.userUuid)

      if (!this.itemShouldBeSaved(itemHash, dto.apiVersion, existingItem)) {
        conflicts.push({
          serverItem: existingItem,
          type: 'sync_conflict'
        })

        continue
      }

      if(existingItem) {
        const updatedItem = await this.updateExistingItem(existingItem, itemHash, dto.userAgent)
        savedItems.push(updatedItem)
      } else {
        try {
          const newItem = await this.saveNewItem(itemHash, dto.userAgent)
          savedItems.push(newItem)
        } catch (_error) {
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
      syncToken
    }
  }

  async frontLoadKeysItemsToTop(userUuid: string, retrievedItems: Array<Item>): Promise<Array<Item>> {
    const itemsKeys = await this.itemRepository.findAll({
      userUuid,
      contentType: ContentType.ItemsKey,
      sortBy: 'updated_at_timestamp',
      sortOrder: 'DESC'
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

  private async updateExistingItem(existingItem: Item, itemHash: ItemHash, userAgent: string): Promise<Item> {
    existingItem.content = itemHash.content
    existingItem.contentType = itemHash.content_type
    if (itemHash.deleted !== undefined) {
      existingItem.deleted = itemHash.deleted
    }
    if (itemHash.duplicate_of) {
      existingItem.duplicateOf = itemHash.duplicate_of
    }
    if (itemHash.auth_hash) {
      existingItem.authHash = itemHash.auth_hash
    }
    existingItem.encItemKey = itemHash.enc_item_key
    existingItem.itemsKeyId = itemHash.items_key_id
    existingItem.lastUserAgent = userAgent

    if (itemHash.deleted === true) {
      existingItem.deleted = true
      existingItem.content = null
      existingItem.encItemKey = null
      existingItem.authHash = null
    }

    existingItem.updatedAt = this.timer.getTimestampInMicroseconds()

    return this.itemRepository.save(existingItem)
  }

  private async saveNewItem(itemHash: ItemHash, userAgent: string): Promise<Item> {
    const newItem = new Item()
    newItem.uuid = itemHash.uuid
    newItem.content = itemHash.content
    newItem.contentType = itemHash.content_type
    newItem.encItemKey = itemHash.enc_item_key
    newItem.itemsKeyId = itemHash.items_key_id
    if (itemHash.auth_hash) {
      newItem.authHash = itemHash.auth_hash
    }
    newItem.lastUserAgent = userAgent
    const now = this.timer.getTimestampInMicroseconds()
    newItem.createdAt = now
    newItem.updatedAt = now

    return this.itemRepository.save(newItem)
  }

  private itemShouldBeSaved(itemHash: ItemHash, apiVersion?: string, existingItem?: Item): boolean {
    if (!existingItem) {
      return true
    }

    const incomingUpdatedAtTimestamp = itemHash.updated_at ?
      this.timer.convertStringDateToMicroseconds(itemHash.updated_at) :
      this.timer.convertStringDateToMicroseconds(new Date(0).toString())

    const ourUpdatedAtTimestamp = existingItem.updatedAt
    const difference = incomingUpdatedAtTimestamp - ourUpdatedAtTimestamp

    return Math.abs(difference) > this.getMinimalConflictIntervalMicroseconds(apiVersion)
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
    if (dto.cursorToken) {
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
