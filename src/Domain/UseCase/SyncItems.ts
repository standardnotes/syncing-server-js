import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { Item } from '../Item/Item'
import { ItemConflict } from '../Item/ItemConflict'
import { ItemServiceInterface } from '../Item/ItemServiceInterface'
import { SyncResponse20161215 } from '../Item/SyncResponse/SyncResponse20161215'
import { SyncResponse20200115 } from '../Item/SyncResponse/SyncResponse20200115'
import { SyncResponseFactoryResolverInterface } from '../Item/SyncResponse/SyncResponseFactoryResolverInterface'
import { SyncItemsDTO } from './SyncItemsDTO'
import { SyncItemsResponse } from './SyncItemsResponse'
import { UseCaseInterface } from './UseCaseInterface'

@injectable()
export class SyncItems implements UseCaseInterface {
  constructor(
    @inject(TYPES.ItemService) private itemService: ItemServiceInterface,
    @inject(TYPES.SyncResponseFactoryResolver) private syncResponseFactoryResolver: SyncResponseFactoryResolverInterface
  ) {
  }

  async execute(dto: SyncItemsDTO): Promise<SyncResponse20161215 | SyncResponse20200115> {
    const getItemsResult = await this.itemService.getItems({
      userUuid: dto.userUuid,
      syncToken: dto.syncToken,
      cursorToken: dto.cursorToken,
      limit: dto.limit,
      contentType: dto.contentType
    })

    const saveItemsResult = await this.itemService.saveItems({
      itemHashes: dto.itemHashes,
      userAgent: dto.userAgent,
      userUuid: dto.userUuid,
      apiVersion: dto.apiVersion
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
      cursorToken: getItemsResult.cursorToken
    }

    if (dto.computeIntegrityHash) {
      syncResponse.integrityHash = await this.itemService.computeIntegrityHash(dto.userUuid)
    }

    return this.syncResponseFactoryResolver
      .resolveSyncResponseFactoryVersion(dto.apiVersion)
      .createResponse(syncResponse)
  }

  private isFirstSync(dto: SyncItemsDTO): boolean {
    return dto.syncToken === undefined
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
