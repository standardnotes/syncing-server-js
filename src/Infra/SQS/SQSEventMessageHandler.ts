import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import * as zlib from 'zlib'
import TYPES from '../../Bootstrap/Types'
import { DomainEventHandlerInterface } from '../../Domain/Handler/DomainEventHandlerInterface'
import { DomainEventInterface } from '../../Domain/Event/DomainEventInterface'
import { EventMessageHandlerInterface } from '../../Domain/Event/EventMessageHandlerInterface'

@injectable()
export class SQSEventMessageHandler implements EventMessageHandlerInterface {
  constructor(
    private handlers: Map<string, DomainEventHandlerInterface>,
    @inject(TYPES.Logger) private logger: Logger
  ) {
  }

  async handleMessage (message: string): Promise<void> {
    const messageParsed = JSON.parse(message)

    const domainEventJson = zlib.unzipSync(Buffer.from(messageParsed.Message, 'base64')).toString()

    const domainEvent: DomainEventInterface = JSON.parse(domainEventJson)

    const handler = this.handlers.get(domainEvent.type)
    if (!handler) {
      this.logger.warn(`Event handler for event type ${domainEvent.type} does not exist`)

      return
    }

    await handler.handle(domainEvent)
  }

  async handleError (error: Error): Promise<void> {
    this.logger.error('Error occured while handling SQS message: %O', error)
  }
}
