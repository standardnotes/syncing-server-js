import 'reflect-metadata'

import { SQS } from 'aws-sdk'

import { SQSDomainEventSubscriberFactory } from './SQSDomainEventSubscriberFactory'
import { EventMessageHandlerInterface } from '../../Domain/Event/EventMessageHandlerInterface'
import { Consumer } from 'sqs-consumer'

describe('SQSDomainEventSubscriberFactory', () => {
  let sqs: SQS
  const queueUrl = 'https://queue-url'
  let eventMessageHandler: EventMessageHandlerInterface

  const createFactory = () => new SQSDomainEventSubscriberFactory(sqs, queueUrl, eventMessageHandler)

  beforeEach(() => {
    sqs = {} as jest.Mocked<SQS>

    eventMessageHandler = {} as jest.Mocked<EventMessageHandlerInterface>
    eventMessageHandler.handleMessage = jest.fn()
    eventMessageHandler.handleError = jest.fn()
  })

  it('should create a domain event subscriber', () => {
    const subscriber = createFactory().create()

    expect(subscriber).toBeInstanceOf(Consumer)
  })
})
