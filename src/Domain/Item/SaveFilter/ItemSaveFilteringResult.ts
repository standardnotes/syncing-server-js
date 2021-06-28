import { Item } from '../Item'
import { ItemConflict } from '../ItemConflict'

export type ItemSaveFilteringResult = {
  passed: boolean
  conflict?: ItemConflict
  skipped?: Item
}
