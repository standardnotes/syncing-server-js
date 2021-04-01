import { ItemHash } from '../Item/ItemHash'

export type SyncItemsDTO = {
  userUuid: string
  itemHashes: Array<ItemHash>
  computeIntegrityHash: boolean
  limit: number
  userAgent?: string,
  syncToken?: string
  cursorToken?: string
  contentType?: string
  apiVersion?: string
}
