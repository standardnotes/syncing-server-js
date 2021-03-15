import * as dayjs from 'dayjs'
import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { GetItemsDTO } from './GetItemsDTO'

import { GetItemsResult } from './GetItemsResult'
import { Item } from './Item'
import { ItemQuery } from './ItemQuery'
import { ItemRepositoryInterface } from './ItemRepositoryInterface'
import { ItemServiceInterface } from './ItemServiceInterface'
import { SaveItemsResult } from './SaveItemsResult'

@injectable()
export class ItemService implements ItemServiceInterface {
  private readonly DEFAULT_ITEMS_LIMIT = 100000
  private readonly SYNC_TOKEN_VERSION = 2

  constructor (
    @inject(TYPES.ItemRepository) private itemRepository: ItemRepositoryInterface,
  ) {
  }

  async getItems(dto: GetItemsDTO): Promise<GetItemsResult> {
    let lastSyncTime = this.getLastSyncTime(dto)

    const itemQuery: ItemQuery = {
      userUuid: dto.userUuid,
      lastSyncTime,
      contentType: dto.contentType,
      deleted: lastSyncTime ? undefined : false,
      sortBy: 'updatedAt',
      limit: !dto.limit || dto.limit < 1 ? this.DEFAULT_ITEMS_LIMIT : dto.limit
    }

    const items = await this.itemRepository.findAll(itemQuery)

    lastSyncTime = items[items.length - 1].updatedAt
    const cursorToken = Buffer.from(`${this.SYNC_TOKEN_VERSION}:${+lastSyncTime}`, 'utf-8').toString('base64')

    return {
      items,
      cursorToken,
    }
  }

  async saveItems(_itemHashes: string[], _userAgent: string, _retrievedItems: Item[]): Promise<SaveItemsResult> {
    throw new Error('Method not implemented.')
  }

  private getLastSyncTime(dto: GetItemsDTO): Date | undefined {
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
      return dayjs.utc(tokenParts.join(':')).toDate()
    case '2':
      return dayjs.unix(+tokenParts[0]).toDate()
    default:
      throw Error('Sync token is missing version part')
    }

  }
}
