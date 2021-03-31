import { SyncItemsResponse } from '../../UseCase/SyncItemsResponse'
import { ItemConflict } from '../ItemConflict'
import { ItemHash } from '../ItemHash'
import { SyncResponse20161215 } from './SyncResponse20161215'
import { SyncResponseFactoryInterface } from './SyncResponseFactoryInterface'

export class SyncResponseFactory20161215 implements SyncResponseFactoryInterface {
  createResponse(syncItemsResponse: SyncItemsResponse): SyncResponse20161215 {
    const unsaved = syncItemsResponse.conflicts.map((conflict: ItemConflict) => ({
      item: conflict.serverItem ?? <ItemHash> conflict.unsavedItem,
      error: {
        tag: conflict.type
      }
    }))

    return {
      retrieved_items: syncItemsResponse.retrievedItems,
      saved_items: syncItemsResponse.savedItems,
      unsaved,
      sync_token: syncItemsResponse.syncToken,
      cursor_token: syncItemsResponse.cursorToken,
      integrity_hash: syncItemsResponse.integrityHash
    }
  }
}
