import 'reflect-metadata'
import { UserRegisteredEvent } from '@standardnotes/domain-events'
import { SuperAgentRequest, SuperAgentStatic } from 'superagent'
import { Logger } from 'winston'

import { UserRegisteredEventHandler } from './UserRegisteredEventHandler'

describe('UserRegisteredEventHandler', () => {
  let httpClient: SuperAgentStatic
  let request: SuperAgentRequest
  const userServerRegistrationUrl = 'https://user-server/registration'
  const userServerAuthKey = 'auth-key'
  let event: UserRegisteredEvent
  let logger: Logger

  const createHandler = () => new UserRegisteredEventHandler(
    httpClient,
    userServerRegistrationUrl,
    userServerAuthKey,
    logger
  )

  beforeEach(() => {
    request = {} as jest.Mocked<SuperAgentRequest>
    request.set = jest.fn().mockReturnThis()
    request.send = jest.fn().mockReturnThis()

    httpClient = {} as jest.Mocked<SuperAgentStatic>
    httpClient.post = jest.fn().mockReturnValue(request)

    event = {} as jest.Mocked<UserRegisteredEvent>
    event.createdAt = new Date(1)
    event.payload = {
      userUuid: '1-2-3',
      email: 'test@test.te'
    }

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
  })

  it('should send a request to the user management server about a registration', async () => {
    await createHandler().handle(event)

    expect(httpClient.post).toHaveBeenCalledWith('https://user-server/registration')
    expect(request.send).toHaveBeenCalledWith({
      key: 'auth-key',
      user: {
        created_at: new Date(1),
        email: 'test@test.te',
      }
    })
  })

  it('should not send a request to the user management server about a registration if url is not defined', async () => {
    const handler = new UserRegisteredEventHandler(
      httpClient,
      '',
      userServerAuthKey,
      logger
    )
    await handler.handle(event)

    expect(httpClient.post).not.toHaveBeenCalled()
    expect(request.send).not.toHaveBeenCalled()
  })
})
