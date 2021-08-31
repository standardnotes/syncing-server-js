import { Item } from './Item'
import { ItemConflictType } from './ItemConflictType'
import { ItemHash } from './ItemHash'

export type ItemConflict = {
  serverItem?: Item
  unsavedItem?: ItemHash
  type: ItemConflictType
}
