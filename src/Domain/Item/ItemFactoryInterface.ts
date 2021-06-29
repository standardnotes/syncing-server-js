import { Item } from './Item'
import { ItemHash } from './ItemHash'

export interface ItemFactoryInterface {
  create(userUuid: string, itemHash: ItemHash, userAgent?: string): Item
}
