import { Uuid, IntegrityPayload } from '@standardnotes/common'

export type CheckIntegrityDTO = {
  userUuid: Uuid,
  integrityHashes: IntegrityPayload[],
}
