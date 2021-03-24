import { ItemHash } from '../Item/ItemHash'

export type SyncItemsDTO = {
  userUuid: string
  itemHashes: Array<ItemHash>
  syncToken: string
  cursorToken: string
  limit: number
  userAgent: string,
  contentType?: string
}
