import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { ItemServiceInterface } from '../Item/ItemServiceInterface'
import { SyncItemsDTO } from './SyncItemsDTO'
import { SyncItemsResponse } from './SyncItemsResponse'
import { UseCaseInterface } from './UseCaseInterface'

@injectable()
export class SyncItems implements UseCaseInterface {
  constructor(
    @inject(TYPES.ItemService) private itemService: ItemServiceInterface
  ) {
  }

  async execute(dto: SyncItemsDTO): Promise<SyncItemsResponse> {
    const getItemsResult = await this.itemService.getItems({
      userUuid: dto.userUuid,
      syncToken: dto.syncToken,
      cursorToken: dto.cursorToken,
      limit: dto.limit,
      contentType: dto.contentType
    })

    const saveItemsResult = await this.itemService.saveItems(
      dto.itemHashes,
      dto.userAgent,
      getItemsResult.items
    )

    return {
      retrievedItems: getItemsResult.items,
      savedItems: saveItemsResult.items,
      conflicts: saveItemsResult.conflicts,
      syncToken: saveItemsResult.syncToken,
      cursorToken: getItemsResult.cursorToken
    }
  }
}
