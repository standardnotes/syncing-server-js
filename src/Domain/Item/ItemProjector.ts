import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { ProjectorInterface } from '../../Projection/ProjectorInterface'

import { Item } from './Item'
import { ItemProjection } from './ItemProjection'

@injectable()
export class ItemProjector implements ProjectorInterface<Item> {
  constructor(
    @inject(TYPES.Timer) private timer: TimerInterface,
  ) {
  }

  projectSimple(_item: Item): Record<string, unknown> {
    throw Error('not implemented')
  }

  projectCustom(_projectionType: string, _item: Item): Record<string, unknown> {
    throw Error('not implemented')
  }

  projectFull(item: Item): ItemProjection {
    return {
      uuid: item.uuid,
      items_key_id: item.itemsKeyId,
      duplicate_of: item.duplicateOf,
      enc_item_key: item.encItemKey,
      content: item.content,
      content_type: item.contentType,
      auth_hash: item.authHash,
      deleted: !!item.deleted,
      created_at: this.timer.convertMicrosecondsToStringDate(item.createdAtTimestamp),
      created_at_timestamp: item.createdAtTimestamp,
      updated_at: this.timer.convertMicrosecondsToStringDate(item.updatedAtTimestamp),
      updated_at_timestamp: item.updatedAtTimestamp,
    }
  }
}
