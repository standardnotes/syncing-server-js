import { ItemConflict } from '../ItemConflict'

export type ItemSaveProcessingResult = {
  passed: boolean
  conflict?: ItemConflict
}
