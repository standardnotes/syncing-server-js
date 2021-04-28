import { ItemHash } from '../../Item/ItemHash'

export type PostToRealtimeExtensionsDTO = {
  itemHashes: Array<ItemHash>
  userUuid: string
}
