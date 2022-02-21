import { ItemIntegrityHash } from '@standardnotes/common'

export type CheckIntegrityResponse = {
  mismatches: ItemIntegrityHash[],
}
