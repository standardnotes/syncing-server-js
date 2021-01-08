import * as dayjs from 'dayjs'
import { injectable } from 'inversify'

import { DomainEventFactoryInterface } from './DomainEventFactoryInterface'
import { UserRegisteredEvent } from './UserRegisteredEvent'

@injectable()
export class DomainEventFactory implements DomainEventFactoryInterface {
  createUserRegisteredEvent(userUuid: string, email: string): UserRegisteredEvent {
    return {
      type: 'USER_REGISTERED',
      createdAt: dayjs.utc().toDate(),
      payload: {
        userUuid,
        email
      }
    }
  }
}
