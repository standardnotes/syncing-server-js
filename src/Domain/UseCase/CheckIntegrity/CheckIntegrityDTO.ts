import { Uuid, IntegrityPayload } from '@standardnotes/common'

export type CheckIntegrityDTO = {
  userUuid: Uuid,
  integrityPayloads: IntegrityPayload[],
}
