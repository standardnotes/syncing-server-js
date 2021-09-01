import { ItemConflictType } from './ItemConflictType'
import { ItemHash } from './ItemHash'
import { ItemProjection } from './ItemProjection'

export type ItemConflictProjection = {
  server_item?: ItemProjection
  unsaved_item?: ItemHash
  type: ItemConflictType
}
