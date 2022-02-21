import { Uuid, ItemIntegrityHash } from '@standardnotes/common'

export type CheckIntegrityDTO = {
  userUuid: Uuid,
  integrityHashes: ItemIntegrityHash[],
}
