import { Item } from './Item'
import { ItemConflictType } from './ItemConflictType'
import { ItemErrorType } from './ItemErrorType'
import { ItemHash } from './ItemHash'

export type ItemConflict = {
  serverItem?: Item
  unsavedItem?: ItemHash
  type: ItemConflictType | ItemErrorType
}
