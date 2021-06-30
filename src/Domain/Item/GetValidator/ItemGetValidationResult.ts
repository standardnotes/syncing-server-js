import { Item } from '../Item'

export type ItemGetValidationResult = {
  passed: boolean
  replaced?: Item
}
