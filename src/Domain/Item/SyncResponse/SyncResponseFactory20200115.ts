import { SyncItemsResponse } from '../../UseCase/SyncItemsResponse'
import { SyncResponse20200115 } from './SyncResponse20200115'
import { SyncResponseFactoryInterface } from './SyncResponseFactoryInterface'

export class SyncResponseFactory20200115 implements SyncResponseFactoryInterface {
  createResponse(syncItemsResponse: SyncItemsResponse): SyncResponse20200115 {
    return {
      retrieved_items: syncItemsResponse.retrievedItems,
      saved_items: syncItemsResponse.savedItems,
      conflicts: syncItemsResponse.conflicts,
      sync_token: syncItemsResponse.syncToken,
      cursor_token: syncItemsResponse.cursorToken,
      integrity_hash: syncItemsResponse.integrityHash
    }
  }
}
