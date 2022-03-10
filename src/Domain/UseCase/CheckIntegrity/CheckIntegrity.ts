import { inject, injectable } from 'inversify'
import { IntegrityPayload } from '@standardnotes/payloads'
import { AnalyticsStoreInterface } from '@standardnotes/analytics'

import TYPES from '../../../Bootstrap/Types'
import { ItemRepositoryInterface } from '../../Item/ItemRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { CheckIntegrityDTO } from './CheckIntegrityDTO'
import { CheckIntegrityResponse } from './CheckIntegrityResponse'

@injectable()
export class CheckIntegrity implements UseCaseInterface {
  constructor(
    @inject(TYPES.ItemRepository) private itemRepository: ItemRepositoryInterface,
    @inject(TYPES.AnalyticsStore) private analyticsStore: AnalyticsStoreInterface,
  ) {
  }

  async execute(dto: CheckIntegrityDTO): Promise<CheckIntegrityResponse> {
    const serverItemIntegrityPayloads = await this.itemRepository
      .findItemsForComputingIntegrityPayloads(dto.userUuid)

    const serverItemIntegrityPayloadsMap = new Map<string, number>()
    for (const serverItemIntegrityPayload of serverItemIntegrityPayloads) {
      serverItemIntegrityPayloadsMap.set(serverItemIntegrityPayload.uuid, serverItemIntegrityPayload.updated_at_timestamp)
    }

    const clientItemIntegrityPayloadsMap = new Map<string, number>()
    for (const clientItemIntegrityPayload of dto.integrityPayloads) {
      clientItemIntegrityPayloadsMap.set(clientItemIntegrityPayload.uuid, clientItemIntegrityPayload.updated_at_timestamp)
    }

    const mismatches: IntegrityPayload[] = []

    for (const serverItemIntegrityPayloadUuid of serverItemIntegrityPayloadsMap.keys()) {
      if (!clientItemIntegrityPayloadsMap.has(serverItemIntegrityPayloadUuid)) {
        mismatches.unshift({
          uuid: serverItemIntegrityPayloadUuid,
          updated_at_timestamp: serverItemIntegrityPayloadsMap.get(serverItemIntegrityPayloadUuid) as number,
        })

        continue
      }

      const serverItemIntegrityPayloadUpdatedAtTimestamp = serverItemIntegrityPayloadsMap.get(serverItemIntegrityPayloadUuid) as number
      const clientItemIntegrityPayloadUpdatedAtTimestamp = clientItemIntegrityPayloadsMap.get(serverItemIntegrityPayloadUuid) as number
      if (serverItemIntegrityPayloadUpdatedAtTimestamp !== clientItemIntegrityPayloadUpdatedAtTimestamp) {
        mismatches.unshift({
          uuid: serverItemIntegrityPayloadUuid,
          updated_at_timestamp: serverItemIntegrityPayloadsMap.get(serverItemIntegrityPayloadUuid) as number,
        })
      }
    }

    if (mismatches.length > 0) {
      await this.analyticsStore.incrementOutOfSyncIncidents()
    }

    return {
      mismatches,
    }
  }
}
