import { ItemHash } from './ItemHash'

export type SaveItemsDTO = {
  itemHashes: ItemHash[]
  userAgent: string
  userUuid: string
  apiVersion?: string
}
