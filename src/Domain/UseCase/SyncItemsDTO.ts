import { ItemHash } from '../Item/ItemHash'

export type SyncItemsDTO = {
  userUuid: string
  itemHashes: Array<ItemHash>
  computeIntegrityHash: boolean
  limit: number
  userAgent?: string,
  syncToken?: string | null
  cursorToken?: string | null
  contentType?: string
  apiVersion?: string
}
