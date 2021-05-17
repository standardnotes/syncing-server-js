import { inject, injectable } from 'inversify'
import TYPES from '../../../Bootstrap/Types'
import { ProjectorInterface } from '../../../Projection/ProjectorInterface'
import { SyncItemsResponse } from '../../UseCase/SyncItemsResponse'
import { Item } from '../Item'
import { ItemConflict } from '../ItemConflict'
import { ItemHash } from '../ItemHash'
import { ItemProjection } from '../ItemProjection'
import { SyncResponse20161215 } from './SyncResponse20161215'
import { SyncResponseFactoryInterface } from './SyncResponseFactoryInterface'

@injectable()
export class SyncResponseFactory20161215 implements SyncResponseFactoryInterface {
  private readonly LEGACY_MIN_CONFLICT_INTERVAL = 20

  constructor(
    @inject(TYPES.ItemProjector) private itemProjector: ProjectorInterface<Item>,
  ){
  }

  createResponse(syncItemsResponse: SyncItemsResponse): SyncResponse20161215 {
    const pickOutConflictsResult = this.pickOutConflicts(
      syncItemsResponse.savedItems,
      syncItemsResponse.retrievedItems,
      syncItemsResponse.conflicts
    )

    const unsaved = pickOutConflictsResult.unsavedItems.map((conflict: ItemConflict) => ({
      item: conflict.serverItem ?
        <ItemProjection> this.itemProjector.projectFull(conflict.serverItem) :
        <ItemHash> conflict.unsavedItem,
      error: {
        tag: conflict.type,
      },
    }))

    return {
      retrieved_items: pickOutConflictsResult.retrievedItems.map(item => <ItemProjection> this.itemProjector.projectFull(item)),
      saved_items: syncItemsResponse.savedItems.map(item => <ItemProjection> this.itemProjector.projectFull(item)),
      unsaved,
      sync_token: syncItemsResponse.syncToken,
      cursor_token: syncItemsResponse.cursorToken,
      integrity_hash: syncItemsResponse.integrityHash,
    }
  }

  private pickOutConflicts(
    savedItems: Array<Item>,
    retrievedItems: Array<Item>,
    unsavedItems: Array<ItemConflict>
  ): {
    unsavedItems: Array<ItemConflict>,
    retrievedItems: Array<Item>,
  } {
    const savedIds: Array<string> = savedItems.map((savedItem: Item) => savedItem.uuid)
    const retrievedIds: Array<string> = retrievedItems.map((retrievedItem: Item) => retrievedItem.uuid)

    const conflictingIds = savedIds.filter(savedId => retrievedIds.includes(savedId))

    for (const conflictingId of conflictingIds) {
      const savedItem = savedItems.find(item => item.uuid === conflictingId
      const conflictedItem = retrievedItems.find(item => item.uuid === conflictingId)

      const difference = savedItem.updatedAtTimestamp - conflictedItem.updatedAtTimestamp

      if (Math.abs(difference) > this.LEGACY_MIN_CONFLICT_INTERVAL) {
        unsavedItems.push({
          serverItem: conflictedItem,
          type: 'sync_conflict',
        })
      }

      retrievedItems = retrievedItems.filter((retrievedItem: Item) => retrievedItem.uuid !== conflictingId)
    }

    return {
      retrievedItems,
      unsavedItems,
    }
  }
}
