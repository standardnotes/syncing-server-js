import { Item } from '../Item'
import { ItemConflict } from '../ItemConflict'

export type SyncResponse20200115 = {
  retrieved_items: Array<Item>
  saved_items: Array<Item>
  conflicts: Array<ItemConflict>
  sync_token: string
  cursor_token?: string
  integrity_hash?: string
}
