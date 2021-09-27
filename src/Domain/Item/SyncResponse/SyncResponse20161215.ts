import { ItemConflictType } from '../ItemConflictType'
import { ItemErrorType } from '../ItemErrorType'
import { ItemHash } from '../ItemHash'
import { ItemProjection } from '../../../Projection/ItemProjection'

export type SyncResponse20161215 = {
  retrieved_items: Array<ItemProjection>
  saved_items: Array<ItemProjection>
  unsaved: Array<{
    item: ItemProjection | ItemHash
    error: {
      tag: ItemConflictType | ItemErrorType
    }
  }>
  sync_token: string
  cursor_token?: string
  integrity_hash?: string
}
