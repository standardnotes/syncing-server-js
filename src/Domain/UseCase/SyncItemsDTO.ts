import { ItemHash } from '../Item/ItemHash'

export type SyncItemsDTO = {
  userUuid: string
  analyticsId: number
  itemHashes: Array<ItemHash>
  computeIntegrityHash: boolean
  limit: number
  syncToken?: string | null
  cursorToken?: string | null
  contentType?: string
  apiVersion: string
  readOnlyAccess: boolean
}
