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
  constructor(
    @inject(TYPES.ItemProjector) private itemProjector: ProjectorInterface<Item>,
  ){
  }

  createResponse(syncItemsResponse: SyncItemsResponse): SyncResponse20161215 {
    const unsaved = syncItemsResponse.conflicts.map((conflict: ItemConflict) => ({
      item: conflict.serverItem ?
        <ItemProjection> this.itemProjector.projectFull(conflict.serverItem) :
        <ItemHash> conflict.unsavedItem,
      error: {
        tag: conflict.type,
      },
    }))

    return {
      retrieved_items: syncItemsResponse.retrievedItems.map(item => <ItemProjection> this.itemProjector.projectFull(item)),
      saved_items: syncItemsResponse.savedItems.map(item => <ItemProjection> this.itemProjector.projectFull(item)),
      unsaved,
      sync_token: syncItemsResponse.syncToken,
      cursor_token: syncItemsResponse.cursorToken,
      integrity_hash: syncItemsResponse.integrityHash,
    }
  }
}
