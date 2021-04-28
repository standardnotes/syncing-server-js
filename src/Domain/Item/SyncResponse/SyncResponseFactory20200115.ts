import { inject, injectable } from 'inversify'
import TYPES from '../../../Bootstrap/Types'
import { ProjectorInterface } from '../../../Projection/ProjectorInterface'
import { SyncItemsResponse } from '../../UseCase/SyncItemsResponse'
import { Item } from '../Item'
import { ItemConflict } from '../ItemConflict'
import { ItemConflictProjection } from '../ItemConflictProjection'
import { ItemProjection } from '../ItemProjection'
import { SyncResponse20200115 } from './SyncResponse20200115'
import { SyncResponseFactoryInterface } from './SyncResponseFactoryInterface'

@injectable()
export class SyncResponseFactory20200115 implements SyncResponseFactoryInterface {
  constructor(
    @inject(TYPES.ItemProjector) private itemProjector: ProjectorInterface<Item>,
    @inject(TYPES.ItemConflictProjector) private itemConflictProjector: ProjectorInterface<ItemConflict>,
  ){
  }

  createResponse(syncItemsResponse: SyncItemsResponse): SyncResponse20200115 {
    return {
      retrieved_items: syncItemsResponse.retrievedItems.map(item => <ItemProjection> this.itemProjector.projectFull(item)),
      saved_items: syncItemsResponse.savedItems.map(item => <ItemProjection> this.itemProjector.projectFull(item)),
      conflicts: syncItemsResponse.conflicts.map(itemConflict => <ItemConflictProjection> this.itemConflictProjector.projectFull(itemConflict)),
      sync_token: syncItemsResponse.syncToken,
      cursor_token: syncItemsResponse.cursorToken,
      integrity_hash: syncItemsResponse.integrityHash,
    }
  }
}
