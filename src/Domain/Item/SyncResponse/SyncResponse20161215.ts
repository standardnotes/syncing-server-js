import { Item } from '../Item'
import { ItemHash } from '../ItemHash'

export type SyncResponse20161215 = {
  retrieved_items: Array<Item>
  saved_items: Array<Item>
  unsaved: Array<{
    item: Item | ItemHash
    error: {
      tag: 'sync_conflict' | 'uuid_conflict'
    }
  }>
  sync_token: string
  cursor_token?: string
  integrity_hash?: string
}
