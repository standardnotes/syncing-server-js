import { ItemIntegrityHash } from '../../Item/ItemIntegrityHash'

export type CheckIntegrityResponse = {
  mismatches: ItemIntegrityHash[],
}
