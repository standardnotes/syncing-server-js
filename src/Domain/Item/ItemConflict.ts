import { Item } from './Item'

export type ItemConflict = {
  item: Item
  type: 'sync_conflict' | 'uuid_conflict'
}
