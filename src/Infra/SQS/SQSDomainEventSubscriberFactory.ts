import { SQS } from 'aws-sdk'
import { Consumer, SQSMessage } from 'sqs-consumer'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { EventMessageHandlerInterface } from '../../Domain/Event/EventMessageHandlerInterface'
import { DomainEventSubscriberFactoryInterface } from '../../Domain/Event/DomainEventSubscriberFactoryInterface'
import { DomainEventSubscriberInterface } from '../../Domain/Event/DomainEventSubscriberInterface'

@injectable()
export class SQSDomainEventSubscriberFactory implements DomainEventSubscriberFactoryInterface {
  constructor (
    @inject(TYPES.SQS) private sqs: SQS,
    @inject(TYPES.SQS_QUEUE_URL) private queueUrl: string,
    @inject(TYPES.EventMessageHandler) private eventMessageHandler: EventMessageHandlerInterface
  ) {
  }

  create (): DomainEventSubscriberInterface {
    const sqsConsumer = Consumer.create({
        attributeNames: ['All'],
        messageAttributeNames: ['compression', 'event'],
        queueUrl: this.queueUrl,
        sqs: this.sqs,
        handleMessage:
          /* istanbul ignore next */
          async (message: SQSMessage) => await this.eventMessageHandler.handleMessage(<string> message.Body)
    })

    sqsConsumer.on('error', this.eventMessageHandler.handleError.bind(this.eventMessageHandler))
    sqsConsumer.on('processing_error', this.eventMessageHandler.handleError.bind(this.eventMessageHandler))

    return sqsConsumer
  }
}
