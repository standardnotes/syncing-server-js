import { Item } from './Item'

export type ItemConflict = {
  serverItem: Item
  type: 'sync_conflict' | 'uuid_conflict'
}
