import { Item } from '../Item'
import { ItemHash } from '../ItemHash'

export type ItemSaveProcessingDTO = {
  userUuid: string
  apiVersion: string
  itemHash: ItemHash
  existingItem?: Item
}
