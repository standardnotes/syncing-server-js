import { ItemConflictProjection } from '../ItemConflictProjection'
import { ItemProjection } from '../ItemProjection'

export type SyncResponse20200115 = {
  retrieved_items: Array<ItemProjection>
  saved_items: Array<ItemProjection>
  conflicts: Array<ItemConflictProjection>
  sync_token: string
  cursor_token?: string
  integrity_hash?: string
}
