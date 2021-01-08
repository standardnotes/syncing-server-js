import * as AWS from 'aws-sdk'

import 'reflect-metadata'
import { DomainEventInterface } from '../../Domain/Event/DomainEventInterface'

import { SNSDomainEventPublisher } from './SNSDomainEventPublisher'

describe('SNSDomainEventPublisher', () => {
  let sns: AWS.SNS
  const topicArn = 'test-topic-arn'
  let event: DomainEventInterface

  const createPublisher = () => new SNSDomainEventPublisher(sns, topicArn)

  beforeEach(() => {
    const publish = {} as jest.Mocked<AWS.Request<AWS.SNS.Types.PublishResponse, AWS.AWSError>>
    publish.promise = jest.fn().mockReturnValue(Promise.resolve())

    sns = {} as jest.Mocked<AWS.SNS>
    sns.publish = jest.fn().mockReturnValue(publish)

    event = {} as jest.Mocked<DomainEventInterface>
    event.type = 'TEST'
    event.payload = { foo: 'bar' }
  })

  it('should publish a domain event', async () => {
    await createPublisher().publish(event)

    expect(sns.publish).toHaveBeenCalledWith({
      Message: 'eJyrViqpLEhVslIKcQ0OUdJRKkiszMlPTFGyqlZKy88HiiclFinV1gIA9tQMhA==',
      MessageAttributes: {
        event: {
          DataType: 'String',
          StringValue: 'TEST',
        },
        compression: {
          DataType: 'String',
          StringValue: 'true',
        },
      },
      TopicArn: 'test-topic-arn',
    })
  })
})
