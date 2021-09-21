import { ItemConflictType } from '../Domain/Item/ItemConflictType'
import { ItemErrorType } from '../Domain/Item/ItemErrorType'
import { ItemHash } from '../Domain/Item/ItemHash'
import { ItemProjection } from './ItemProjection'

export type ItemConflictProjection = {
  server_item?: ItemProjection
  unsaved_item?: ItemHash
  type: ItemConflictType | ItemErrorType
}
