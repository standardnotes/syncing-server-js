import { inject, injectable } from 'inversify'

import TYPES from '../../../Bootstrap/Types'
import { ItemIntegrityHash } from '../../Item/ItemIntegrityHash'
import { ItemRepositoryInterface } from '../../Item/ItemRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { CheckIntegrityDTO } from './CheckIntegrityDTO'
import { CheckIntegrityResponse } from './CheckIntegrityResponse'

@injectable()
export class CheckIntegrity implements UseCaseInterface {
  constructor(
    @inject(TYPES.ItemRepository) private itemRepository: ItemRepositoryInterface,
  ) {
  }

  async execute(dto: CheckIntegrityDTO): Promise<CheckIntegrityResponse> {
    const serverItemIntegrityHashes = await this.itemRepository
      .findItemsForComputingIntegrityHash(dto.userUuid)

    const mismatches: ItemIntegrityHash[] = []

    for (const serverItemIntegrityHash of serverItemIntegrityHashes) {
      const matchingClientItemIntegrityHash = dto.integrityHashes
        .find(
          (clientItemIntegrityHash) =>
            clientItemIntegrityHash.uuid === serverItemIntegrityHash.uuid &&
            clientItemIntegrityHash.updated_at_timestamp === serverItemIntegrityHash.updated_at_timestamp
        )

      if (matchingClientItemIntegrityHash === undefined) {
        mismatches.unshift(serverItemIntegrityHash)
      }
    }

    return {
      mismatches,
    }
  }
}
