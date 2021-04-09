import { Item } from '../../Item/Item'

export type PostToDailyExtensionsDTO = {
  userUuid: string
  items: Array<Item>
}
