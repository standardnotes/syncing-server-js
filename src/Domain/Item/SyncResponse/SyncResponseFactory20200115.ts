import { inject, injectable } from 'inversify'
import TYPES from '../../../Bootstrap/Types'
import { ProjectorInterface } from '../../../Projection/ProjectorInterface'
import { SyncItemsResponse } from '../../UseCase/SyncItemsResponse'
import { Item } from '../Item'
import { ItemConflict } from '../ItemConflict'
import { ItemConflictProjection } from '../../../Projection/ItemConflictProjection'
import { ItemProjection } from '../../../Projection/ItemProjection'
import { SyncResponse20200115 } from './SyncResponse20200115'
import { SyncResponseFactoryInterface } from './SyncResponseFactoryInterface'

@injectable()
export class SyncResponseFactory20200115 implements SyncResponseFactoryInterface {
  constructor(
    @inject(TYPES.ItemProjector) private itemProjector: ProjectorInterface<Item>,
    @inject(TYPES.ItemConflictProjector) private itemConflictProjector: ProjectorInterface<ItemConflict>,
  ){
  }

  async createResponse(syncItemsResponse: SyncItemsResponse): Promise<SyncResponse20200115> {
    const retrievedItems = []
    for (const item of syncItemsResponse.retrievedItems) {
      retrievedItems.push(<ItemProjection> await this.itemProjector.projectFull(item))
    }

    const savedItems = []
    for (const item of syncItemsResponse.savedItems) {
      savedItems.push(<ItemProjection> await this.itemProjector.projectFull(item))
    }

    const conflicts = []
    for (const itemConflict of syncItemsResponse.conflicts) {
      conflicts.push(<ItemConflictProjection> await this.itemConflictProjector.projectFull(itemConflict))
    }

    return {
      retrieved_items: retrievedItems,
      saved_items: savedItems,
      conflicts,
      sync_token: syncItemsResponse.syncToken,
      cursor_token: syncItemsResponse.cursorToken,
      integrity_hash: syncItemsResponse.integrityHash,
    }
  }
}
