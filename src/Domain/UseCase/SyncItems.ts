import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { Item } from '../Item/Item'
import { ItemConflict } from '../Item/ItemConflict'
import { ItemServiceInterface } from '../Item/ItemServiceInterface'
import { SyncItemsDTO } from './SyncItemsDTO'
import { SyncItemsResponse } from './SyncItemsResponse'
import { UseCaseInterface } from './UseCaseInterface'

@injectable()
export class SyncItems implements UseCaseInterface {
  constructor(
    @inject(TYPES.ItemService) private itemService: ItemServiceInterface,
    @inject(TYPES.DISABLE_INTEGRITY_HASH) private integrityHashIsDisabled: boolean,
  ) {
  }

  async execute(dto: SyncItemsDTO): Promise<SyncItemsResponse> {
    const getItemsResult = await this.itemService.getItems({
      userUuid: dto.userUuid,
      syncToken: dto.syncToken,
      cursorToken: dto.cursorToken,
      limit: dto.limit,
      contentType: dto.contentType,
    })

    const saveItemsResult = await this.itemService.saveItems({
      itemHashes: dto.itemHashes,
      userAgent: dto.userAgent,
      userUuid: dto.userUuid,
      apiVersion: dto.apiVersion,
    })

    let retrievedItems = this.filterOutSyncConflictsForConsecutiveSyncs(getItemsResult.items, saveItemsResult.conflicts)
    if (this.isFirstSync(dto)) {
      retrievedItems = await this.itemService.frontLoadKeysItemsToTop(dto.userUuid, retrievedItems)
    }

    const syncResponse: SyncItemsResponse = {
      retrievedItems,
      syncToken: saveItemsResult.syncToken,
      savedItems: saveItemsResult.savedItems,
      conflicts: saveItemsResult.conflicts,
      cursorToken: getItemsResult.cursorToken,
    }

    if (!this.integrityHashIsDisabled && dto.computeIntegrityHash) {
      syncResponse.integrityHash = await this.itemService.computeIntegrityHash(dto.userUuid)
    }

    return syncResponse
  }

  private isFirstSync(dto: SyncItemsDTO): boolean {
    return dto.syncToken === undefined || dto.syncToken === null
  }

  private filterOutSyncConflictsForConsecutiveSyncs(retrievedItems: Array<Item>, conflicts: Array<ItemConflict>): Array<Item> {
    const syncConflictIds: Array<string> = []
    conflicts.forEach((conflict: ItemConflict) => {
      if (conflict.type === 'sync_conflict' && conflict.serverItem) {
        syncConflictIds.push(conflict.serverItem.uuid)
      }
    })

    return retrievedItems.filter((item: Item) => syncConflictIds.indexOf(item.uuid) === -1)
  }
}
