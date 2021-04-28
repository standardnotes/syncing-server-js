import { ItemHash } from '../ItemHash'
import { ItemProjection } from '../ItemProjection'

export type SyncResponse20161215 = {
  retrieved_items: Array<ItemProjection>
  saved_items: Array<ItemProjection>
  unsaved: Array<{
    item: ItemProjection | ItemHash
    error: {
      tag: 'sync_conflict' | 'uuid_conflict'
    }
  }>
  sync_token: string
  cursor_token?: string
  integrity_hash?: string
}
