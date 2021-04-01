import { DomainEventFactoryInterface, ItemsSyncedEvent, UserRegisteredEvent } from '@standardnotes/domain-events'
import * as dayjs from 'dayjs'
import { injectable } from 'inversify'

@injectable()
export class DomainEventFactory implements DomainEventFactoryInterface {
  createItemsSyncedEvent(userUuid: string, extensionUrl: string, extensionId: string, itemUuids: string[], forceMute: boolean): ItemsSyncedEvent {
    return {
      type: 'ITEMS_SYNCED',
      createdAt: dayjs.utc().toDate(),
      payload: {
        userUuid,
        extensionUrl,
        extensionId,
        itemUuids,
        forceMute,
      },
    }
  }

  createUserRegisteredEvent(userUuid: string, email: string): UserRegisteredEvent {
    return {
      type: 'USER_REGISTERED',
      createdAt: dayjs.utc().toDate(),
      payload: {
        userUuid,
        email,
      },
    }
  }
}
