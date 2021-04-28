import 'reflect-metadata'
import { Logger } from 'winston'

import { ProjectorInterface } from '../../Projection/ProjectorInterface'
import { EphemeralSession } from '../Session/EphemeralSession'
import { Session } from '../Session/Session'
import { SessionServiceInterace } from '../Session/SessionServiceInterface'
import { User } from '../User/User'
import { AuthHttpServiceInterface } from './AuthHttpServiceInterface'
import { AuthResponseFactory20200115 } from './AuthResponseFactory20200115'

describe('AuthResponseFactory20200115', () => {
  let sessionService: SessionServiceInterace
  let authHttpService: AuthHttpServiceInterface
  let userProjector: ProjectorInterface<User>
  let user: User
  let session: Session
  let ephemeralSession: EphemeralSession
  let logger: Logger

  const createFactory = () => new AuthResponseFactory20200115(
    sessionService,
    authHttpService,
    userProjector,
    'secret',
    logger
  )

  beforeEach(() => {
    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()

    session = {} as jest.Mocked<Session>

    ephemeralSession = {} as jest.Mocked<EphemeralSession>

    sessionService = {} as jest.Mocked<SessionServiceInterace>
    sessionService.createNewSessionForUser = jest.fn().mockReturnValue(session)
    sessionService.createNewEphemeralSessionForUser = jest.fn().mockReturnValue(ephemeralSession)
    sessionService.createTokens = jest.fn().mockReturnValue({
      access_token: 'access_token',
      refresh_token: 'refresh_token',
      access_expiration: 123,
      refresh_expiration: 234,
    })

    authHttpService = {} as jest.Mocked<AuthHttpServiceInterface>
    authHttpService.getUserKeyParams = jest.fn().mockReturnValue({
      key1: 'value1',
      key2: 'value2',
    })

    userProjector = {} as jest.Mocked<ProjectorInterface<User>>
    userProjector.projectSimple = jest.fn().mockReturnValue({ foo: 'bar' })

    user = {} as jest.Mocked<User>
    user.encryptedPassword = 'test123'
  })

  it('should create a 20161215 auth response if user does not support sessions', async () => {
    user.supportsSessions = jest.fn().mockReturnValue(false)

    const response = await createFactory().createResponse(user, '20161215', 'Google Chrome', false)

    expect(response).toEqual({
      user: { foo: 'bar' },
      token: expect.any(String),
    })
  })

  it('should create a 20200115 auth response', async () => {
    user.supportsSessions = jest.fn().mockReturnValue(true)

    const response = await createFactory().createResponse(user, '20200115', 'Google Chrome', false)

    expect(response).toEqual({
      key_params: {
        key1: 'value1',
        key2: 'value2',
      },
      session: {
        access_token: 'access_token',
        refresh_token: 'refresh_token',
        access_expiration: 123,
        refresh_expiration: 234,
      },
      user: {
        foo: 'bar',
      },
    })
  })

  it('should create a 20200115 auth response with an ephemeral session', async () => {
    user.supportsSessions = jest.fn().mockReturnValue(true)

    const response = await createFactory().createResponse(user, '20200115', 'Google Chrome', true)

    expect(response).toEqual({
      key_params: {
        key1: 'value1',
        key2: 'value2',
      },
      session: {
        access_token: 'access_token',
        refresh_token: 'refresh_token',
        access_expiration: 123,
        refresh_expiration: 234,
      },
      user: {
        foo: 'bar',
      },
    })
  })
})
