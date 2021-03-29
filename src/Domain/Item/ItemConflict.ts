import { Item } from './Item'
import { ItemHash } from './ItemHash'

export type ItemConflict = {
  serverItem?: Item
  unsavedItem?: ItemHash
  type: 'sync_conflict' | 'uuid_conflict'
}
