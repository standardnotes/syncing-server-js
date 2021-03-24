import { Item } from './Item'
import { ItemHash } from './ItemHash'

export type SaveItemsDTO = {
  items: ItemHash[]
  userAgent: string
  userUuid: string
  retrievedItems: Item[]
}
