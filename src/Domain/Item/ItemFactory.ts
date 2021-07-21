import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { Item } from './Item'
import { ItemFactoryInterface } from './ItemFactoryInterface'
import { ItemHash } from './ItemHash'

@injectable()
export class ItemFactory implements ItemFactoryInterface {
  constructor (
    @inject(TYPES.Timer) private timer: TimerInterface
  ) {
  }

  createStub(userUuid: string, itemHash: ItemHash, userAgent?: string): Item {
    const item = this.create(userUuid, itemHash, userAgent)

    if(itemHash.content === undefined) {
      item.content = null
    }

    if (itemHash.updated_at_timestamp) {
      item.updatedAtTimestamp = itemHash.updated_at_timestamp
      item.updatedAt = this.timer.convertMicrosecondsToDate(itemHash.updated_at_timestamp)
    } else if (itemHash.updated_at) {
      item.updatedAtTimestamp = this.timer.convertStringDateToMicroseconds(itemHash.updated_at)
      item.updatedAt = this.timer.convertStringDateToDate(itemHash.updated_at)
    }

    return item
  }

  create(userUuid: string, itemHash: ItemHash, userAgent?: string): Item {
    const newItem = new Item()
    newItem.uuid = itemHash.uuid
    if (itemHash.content) {
      newItem.content = itemHash.content
    }
    newItem.userUuid = userUuid
    if (itemHash.content_type) {
      newItem.contentType = itemHash.content_type
    }
    if (itemHash.enc_item_key) {
      newItem.encItemKey = itemHash.enc_item_key
    }
    if (itemHash.items_key_id) {
      newItem.itemsKeyId = itemHash.items_key_id
    }
    if (itemHash.duplicate_of) {
      newItem.duplicateOf = itemHash.duplicate_of
    }
    if (itemHash.deleted !== undefined) {
      newItem.deleted = itemHash.deleted
    }
    if (itemHash.auth_hash) {
      newItem.authHash = itemHash.auth_hash
    }
    newItem.lastUserAgent = userAgent ?? null

    const now = this.timer.getTimestampInMicroseconds()
    const nowDate = this.timer.convertMicrosecondsToDate(now)

    newItem.updatedAtTimestamp = now
    newItem.updatedAt = nowDate

    newItem.createdAtTimestamp = now
    newItem.createdAt = nowDate

    if (itemHash.created_at_timestamp) {
      newItem.createdAtTimestamp = itemHash.created_at_timestamp
      newItem.createdAt = this.timer.convertMicrosecondsToDate(itemHash.created_at_timestamp)
    } else if (itemHash.created_at) {
      newItem.createdAtTimestamp = this.timer.convertStringDateToMicroseconds(itemHash.created_at)
      newItem.createdAt = this.timer.convertStringDateToDate(itemHash.created_at)
    }

    return newItem
  }
}
