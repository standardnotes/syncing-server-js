import { Item } from './Item'
import { ItemConflict } from './ItemConflict'

export type SaveItemsResult = {
  items: Array<Item>
  conflicts: Array<ItemConflict>
  syncToken: string
}
