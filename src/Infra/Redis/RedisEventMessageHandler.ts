import * as zlib from 'zlib'

import { inject, injectable } from 'inversify'
import { EventMessageHandlerInterface } from '../../Domain/Event/EventMessageHandlerInterface'
import { DomainEventHandlerInterface } from '../../Domain/Handler/DomainEventHandlerInterface'
import TYPES from '../../Bootstrap/Types'
import { Logger } from 'winston'
import { DomainEventInterface } from '../../Domain/Event/DomainEventInterface'

@injectable()
export class RedisEventMessageHandler implements EventMessageHandlerInterface {
  constructor(
    private handlers: Map<string, DomainEventHandlerInterface>,
    @inject(TYPES.Logger) private logger: Logger
  ) {
  }

  async handleMessage (message: string): Promise<void> {
    try {
      const domainEventJson = zlib.unzipSync(Buffer.from(message, 'base64')).toString()

      const domainEvent: DomainEventInterface = JSON.parse(domainEventJson)

      const handler = this.handlers.get(domainEvent.type)
      if (!handler) {
        this.logger.warn(`Event handler for event type ${domainEvent.type} does not exist`)

        return
      }

      await handler.handle(domainEvent)
    } catch (error) {
      await this.handleError(error)
    }
  }

  async handleError (error: Error): Promise<void> {
    this.logger.error('Error occured while handling Redis message: %O', error)
  }
}
