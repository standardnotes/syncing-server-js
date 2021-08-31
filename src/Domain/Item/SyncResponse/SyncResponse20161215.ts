import { ItemConflictType } from '../ItemConflictType'
import { ItemHash } from '../ItemHash'
import { ItemProjection } from '../ItemProjection'

export type SyncResponse20161215 = {
  retrieved_items: Array<ItemProjection>
  saved_items: Array<ItemProjection>
  unsaved: Array<{
    item: ItemProjection | ItemHash
    error: {
      tag: ItemConflictType
    }
  }>
  sync_token: string
  cursor_token?: string
  integrity_hash?: string
}
