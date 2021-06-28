import { Item } from '../Item'
import { ItemConflict } from '../ItemConflict'

export type ItemSaveProcessingResult = {
  passed: boolean
  conflict?: ItemConflict
  skipped?: Item
}
