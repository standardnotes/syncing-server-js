import { Item } from '../Item'
import { ItemHash } from '../ItemHash'

export type ItemSaveProcessingDTO = {
  userUuid: string
  itemHash: ItemHash
  existingItem?: Item
}
