import 'reflect-metadata'

import { ProjectorInterface } from '../../Projection/ProjectorInterface'
import { Session } from '../Session/Session'
import { SessionServiceInterace } from '../Session/SessionServiceInterface'
import { KeyParamsFactoryInterface } from '../User/KeyParamsFactoryInterface'
import { User } from '../User/User'
import { AuthResponseFactory } from './AuthResponseFactory'

describe('AuthResponseFactory', () => {
  let sessionService: SessionServiceInterace
  let keyParamsFactory: KeyParamsFactoryInterface
  let userProjector: ProjectorInterface<User>
  let user: User
  let session: Session

  const createFactory = () => new AuthResponseFactory(
    sessionService,
    keyParamsFactory,
    userProjector,
    'secret'
  )

  beforeEach(() => {
    session = {} as jest.Mocked<Session>

    sessionService = {} as jest.Mocked<SessionServiceInterace>
    sessionService.createNewSessionForUser = jest.fn().mockReturnValue(session)
    sessionService.createTokens = jest.fn().mockReturnValue({
      access_token: 'access_token',
      refresh_token: 'refresh_token',
      access_expiration: 123,
      refresh_expiration: 234
    })

    keyParamsFactory = {} as jest.Mocked<KeyParamsFactoryInterface>
    keyParamsFactory.create = jest.fn().mockReturnValue({
      key1: 'value1',
      key2: 'value2',
    })

    userProjector = {} as jest.Mocked<ProjectorInterface<User>>
    userProjector.projectSimple = jest.fn().mockReturnValue({ foo: 'bar' })

    user = {} as jest.Mocked<User>
    user.encryptedPassword = 'test123'
  })

  it('should create a legacy auth response for old API version', async () => {
    const response = await createFactory().createSuccessAuthResponse(user, '20161215', 'Google Chrome')

    expect(response).toEqual({
      user: { foo: 'bar' },
      token: expect.any(String)
    })
  })

  it('should create a legacy auth response for new API version if user does not support sessions', async () => {
    user.supportsSessions = jest.fn().mockReturnValue(false)

    const response = await createFactory().createSuccessAuthResponse(user, '20200115', 'Google Chrome')

    expect(response).toEqual({
      user: { foo: 'bar' },
      token: expect.any(String)
    })
  })

  it('should create a current auth response for new API version', async () => {
    user.supportsSessions = jest.fn().mockReturnValue(true)

    const response = await createFactory().createSuccessAuthResponse(user, '20200115', 'Google Chrome')

    expect(response).toEqual({
      key_params: {
        key1: 'value1',
        key2: 'value2',
      },
      session: {
        access_token: 'access_token',
        refresh_token: 'refresh_token',
        access_expiration: 123,
        refresh_expiration: 234
      },
      user: {
        foo: 'bar'
      }
    })
  })
})
