import { DomainEventHandlerInterface, UserRegisteredEvent } from '@standardnotes/domain-events'
import { SuperAgentStatic } from 'superagent'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'

@injectable()
export class UserRegisteredEventHandler implements DomainEventHandlerInterface {
  constructor (
    @inject(TYPES.HTTPClient) private httpClient: SuperAgentStatic,
    @inject(TYPES.USER_SERVER_REGISTRATION_URL) private userServerRegistrationUrl: string,
    @inject(TYPES.USER_SERVER_AUTH_KEY) private userServerAuthKey: string,
  ) {
  }

  async handle(event: UserRegisteredEvent): Promise<void> {
    await this.httpClient
      .post(this.userServerRegistrationUrl)
      .set('Content-Type', 'application/json')
      .send({
        key: this.userServerAuthKey,
        user: {
          email: event.payload.email,
          created_at: event.createdAt
        }
      })
  }
}
