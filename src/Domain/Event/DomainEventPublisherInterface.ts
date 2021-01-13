import { DomainEventInterface } from './DomainEventInterface'

export interface DomainEventPublisherInterface {
  publish(event: DomainEventInterface): Promise<void>
}
