import { inject, injectable } from 'inversify'
import { IntegrityPayload } from '@standardnotes/common'

import TYPES from '../../../Bootstrap/Types'
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

    const serverItemIntegrityHashesMap = new Map<string, number>()
    for (const serverItemIntegrityHash of serverItemIntegrityHashes) {
      serverItemIntegrityHashesMap.set(serverItemIntegrityHash.uuid, serverItemIntegrityHash.updated_at_timestamp)
    }

    const clientItemIntegrityHashesMap = new Map<string, number>()
    for (const clientItemIntegrityHash of dto.integrityHashes) {
      clientItemIntegrityHashesMap.set(clientItemIntegrityHash.uuid, clientItemIntegrityHash.updated_at_timestamp)
    }

    const mismatches: IntegrityPayload[] = []

    for (const serverItemIntegrityHashUuid of serverItemIntegrityHashesMap.keys()) {
      if (!clientItemIntegrityHashesMap.has(serverItemIntegrityHashUuid)) {
        mismatches.unshift({
          uuid: serverItemIntegrityHashUuid,
          updated_at_timestamp: serverItemIntegrityHashesMap.get(serverItemIntegrityHashUuid) as number,
        })

        continue
      }

      const serverItemIntegrityHashUpdatedAtTimestamp = serverItemIntegrityHashesMap.get(serverItemIntegrityHashUuid) as number
      const clientItemIntegrityHashUpdatedAtTimestamp = clientItemIntegrityHashesMap.get(serverItemIntegrityHashUuid) as number
      if (serverItemIntegrityHashUpdatedAtTimestamp !== clientItemIntegrityHashUpdatedAtTimestamp) {
        mismatches.unshift({
          uuid: serverItemIntegrityHashUuid,
          updated_at_timestamp: serverItemIntegrityHashesMap.get(serverItemIntegrityHashUuid) as number,
        })
      }
    }

    return {
      mismatches,
    }
  }
}
