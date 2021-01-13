import { UserRegisteredEvent } from './UserRegisteredEvent'

export interface DomainEventFactoryInterface {
  createUserRegisteredEvent(userUuid: string, email: string): UserRegisteredEvent
}
