import { IntegrityPayload } from '@standardnotes/common'

export type CheckIntegrityResponse = {
  mismatches: IntegrityPayload[],
}
