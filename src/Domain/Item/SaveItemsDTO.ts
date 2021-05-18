import { ItemHash } from './ItemHash'

export type SaveItemsDTO = {
  itemHashes: ItemHash[]
  userUuid: string
  userAgent?: string
  apiVersion: string
}
