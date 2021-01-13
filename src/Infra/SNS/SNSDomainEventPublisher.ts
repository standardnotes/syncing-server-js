import * as AWS from 'aws-sdk'
import * as zlib from 'zlib'

import { inject, injectable } from 'inversify'
import { DomainEventInterface } from '../../Domain/Event/DomainEventInterface'
import { DomainEventPublisherInterface } from '../../Domain/Event/DomainEventPublisherInterface'
import TYPES from '../../Bootstrap/Types'

@injectable()
export class SNSDomainEventPublisher implements DomainEventPublisherInterface {
  constructor (
    @inject(TYPES.SNS) private snsClient: AWS.SNS,
    @inject(TYPES.SNS_TOPIC_ARN) private topicArn: string,
  ) {
  }

  async publish(event: DomainEventInterface): Promise<void> {
    const message: AWS.SNS.PublishInput = {
      TopicArn: this.topicArn,
      MessageAttributes: {
        event: {
          DataType: 'String',
          StringValue: event.type,
        },
        compression: {
          DataType: 'String',
          StringValue: 'true',
        },
      },
      Message: zlib.deflateSync(JSON.stringify(event)).toString('base64'),
    }

    await this.snsClient.publish(message).promise()
  }
}
