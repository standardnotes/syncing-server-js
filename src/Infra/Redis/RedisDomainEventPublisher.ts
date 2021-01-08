import * as IORedis from 'ioredis'
import * as zlib from 'zlib'

import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { DomainEventPublisherInterface } from '../../Domain/Event/DomainEventPublisherInterface'
import { DomainEventInterface } from '../../Domain/Event/DomainEventInterface'

@injectable()
export class RedisDomainEventPublisher implements DomainEventPublisherInterface{
  private readonly EVENT_CHANNEL = 'events'
  constructor (
    @inject(TYPES.Redis) private redisClient: IORedis.Redis,
  ) {
  }

  async publish(event: DomainEventInterface): Promise<void> {
    const message = zlib.deflateSync(JSON.stringify(event)).toString('base64')

    await this.redisClient.publish(this.EVENT_CHANNEL, message)
  }
}
