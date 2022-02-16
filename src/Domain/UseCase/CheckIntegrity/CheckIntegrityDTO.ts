import { Uuid } from '@standardnotes/common'
import { ItemIntegrityHash } from '../../Item/ItemIntegrityHash'

export type CheckIntegrityDTO = {
  userUuid: Uuid,
  integrityHashes: ItemIntegrityHash[],
}
