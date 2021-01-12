import * as IORedis from 'ioredis'

import { inject, injectable } from 'inversify'
import { DomainEventSubscriberFactoryInterface } from '../../Domain/Event/DomainEventSubscriberFactoryInterface'
import { DomainEventSubscriberInterface } from '../../Domain/Event/DomainEventSubscriberInterface'
import { RedisDomainEventSubscriber } from './RedisDomainEventSubscriber'
import TYPES from '../../Bootstrap/Types'
import { EventMessageHandlerInterface } from '../../Domain/Event/EventMessageHandlerInterface'

@injectable()
export class RedisDomainEventSubscriberFactory implements DomainEventSubscriberFactoryInterface {
  private readonly EVENT_CHANNEL = 'events'

  constructor (
    @inject(TYPES.Redis) private redisClient: IORedis.Redis,
    @inject(TYPES.EventMessageHandler) private eventMessageHandler: EventMessageHandlerInterface
  ) {
  }

  create(): DomainEventSubscriberInterface {
    const subscriber = new RedisDomainEventSubscriber(
      this.redisClient,
      this.EVENT_CHANNEL
    )

    this.redisClient.on(
      'message',
      /* istanbul ignore next */
      async (_channel: string, message: string) => await this.eventMessageHandler.handleMessage(message)
    )

    return subscriber
  }
}
