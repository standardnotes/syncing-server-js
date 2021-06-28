import { Time, TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'
import TYPES from '../../../Bootstrap/Types'
import { ApiVersion } from '../../Api/ApiVersion'
import { ItemHash } from '../ItemHash'
import { ItemSaveProcessingDTO } from '../SaveProcessor/ItemSaveProcessingDTO'
import { ItemSaveFilteringResult } from './ItemSaveFilteringResult'
import { ItemSaveFilterInterface } from './ItemSaveFilterInterface'

@injectable()
export class TimeDifferenceFilter implements ItemSaveFilterInterface {
  constructor (
    @inject(TYPES.Timer) private timer: TimerInterface,
  ) {
  }

  async filter(dto: ItemSaveProcessingDTO): Promise<ItemSaveFilteringResult> {
    if (!dto.existingItem) {
      return {
        passed: true,
      }
    }

    let incomingUpdatedAtTimestamp = dto.itemHash.updated_at_timestamp
    if (incomingUpdatedAtTimestamp === undefined) {
      incomingUpdatedAtTimestamp = dto.itemHash.updated_at !== undefined ? this.timer.convertStringDateToMicroseconds(dto.itemHash.updated_at) :
        this.timer.convertStringDateToMicroseconds(new Date(0).toString())
    }

    if (this.itemWasSentFromALegacyClient(incomingUpdatedAtTimestamp, dto.apiVersion)) {
      return {
        passed: true,
      }
    }

    const ourUpdatedAtTimestamp = dto.existingItem.updatedAtTimestamp
    const difference = incomingUpdatedAtTimestamp - ourUpdatedAtTimestamp

    if (this.itemHashHasMicrosecondsPrecision(dto.itemHash)) {
      const passed = difference === 0
      return {
        passed,
        conflict: passed ? undefined : {
          serverItem: dto.existingItem,
          type: 'sync_conflict',
        },
      }
    }

    const passed = Math.abs(difference) < this.getMinimalConflictIntervalMicroseconds(dto.apiVersion)
    return {
      passed,
      conflict: passed ? undefined : {
        serverItem: dto.existingItem,
        type: 'sync_conflict',
      },
    }
  }

  private itemWasSentFromALegacyClient(incomingUpdatedAtTimestamp: number, apiVersion: string) {
    return incomingUpdatedAtTimestamp === 0 && apiVersion === ApiVersion.v20161215
  }

  private itemHashHasMicrosecondsPrecision(itemHash: ItemHash) {
    return itemHash.updated_at_timestamp !== undefined
  }

  private getMinimalConflictIntervalMicroseconds(apiVersion?: string): number {
    switch(apiVersion) {
    case ApiVersion.v20161215:
      return Time.MicrosecondsInASecond
    default:
      return Time.MicrosecondsInAMillisecond
    }
  }
}