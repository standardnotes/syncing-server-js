import { ItemConflict } from '../ItemConflict'

export type ItemSaveFilteringResult = {
  passed: boolean
  conflict?: ItemConflict
}
