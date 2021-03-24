import * as dayjs from 'dayjs'
import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
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
  private readonly MIN_CONFLICT_INTERVAL_MICROSECONDS = 1000000

  constructor (
    @inject(TYPES.ItemRepository) private itemRepository: ItemRepositoryInterface,
  ) {
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
      const lastSyncTime = (items[items.length - 1].updatedAt) / 1000000
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

    await Promise.all(dto.itemHashes.map(async (item: ItemHash) => {
      const existingItem = await this.itemRepository.findByUuidAndUserUuid(item.uuid, dto.userUuid)

      if (existingItem && this.itemShouldNotBeSaved(item, existingItem)) {
        conflicts.push({
          serverItem: existingItem,
          type: 'sync_conflict'
        })
        // dto.retrievedItems.delete
      }
    }))

    return {
      savedItems,
      conflicts
    }
  }

  private async itemShouldNotBeSaved(incomingItem: ItemHash, existingItem: Item): Promise<boolean> {
    const incomingUpdatedAtTimestamp = incomingItem.updated_at ?
      dayjs.utc(incomingItem.updated_at).valueOf() * 1000 :
      dayjs.utc().valueOf() * 1000

    const ourUpdatedAtTimestamp = existingItem.updatedAt
    const difference = incomingUpdatedAtTimestamp - ourUpdatedAtTimestamp

    if (difference == 0) {
      return true
    }

    return Math.abs(difference) < this.MIN_CONFLICT_INTERVAL_MICROSECONDS
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
      return dayjs.utc(tokenParts.join(':')).valueOf() * 1000
    case '2':
      return +tokenParts[0] * 1000000
    default:
      throw Error('Sync token is missing version part')
    }

  }
}
