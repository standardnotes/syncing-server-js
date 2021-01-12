import { DomainEventInterface } from './DomainEventInterface'

export interface DomainEventHandlerInterface {
  handle (event: DomainEventInterface): Promise<void>
}
