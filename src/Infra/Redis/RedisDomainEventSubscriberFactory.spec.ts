import 'reflect-metadata'

import * as IORedis from 'ioredis'

import { RedisDomainEventSubscriberFactory } from './RedisDomainEventSubscriberFactory'
import { EventMessageHandlerInterface } from '../../Domain/Event/EventMessageHandlerInterface'
import { RedisDomainEventSubscriber } from './RedisDomainEventSubscriber'

describe('RedisDomainEventSubscriberFactory', () => {
  let redisClient: IORedis.Redis
  let eventMessageHandler: EventMessageHandlerInterface

  const createFactory = () => new RedisDomainEventSubscriberFactory(redisClient, eventMessageHandler)

  beforeEach(() => {
    redisClient = {} as jest.Mocked<IORedis.Redis>
    redisClient.on = jest.fn()

    eventMessageHandler = {} as jest.Mocked<EventMessageHandlerInterface>
    eventMessageHandler.handleMessage = jest.fn()
  })

  it('should create an event subscriber', () => {
    const subscriber = createFactory().create()

    expect(subscriber).toBeInstanceOf(RedisDomainEventSubscriber)
    expect(redisClient.on).toHaveBeenCalledWith('message', expect.any(Function))
  })
})
