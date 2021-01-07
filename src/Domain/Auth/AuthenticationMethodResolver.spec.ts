import 'reflect-metadata'
import { ArchivedSession } from '../Session/ArchivedSession'
import { Session } from '../Session/Session'
import { SessionServiceInterace } from '../Session/SessionServiceInterface'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'

import { AuthenticationMethodResolver } from './AuthenticationMethodResolver'
import { TokenDecoderInterface } from './TokenDecoderInterface'

describe('AuthenticationMethodResolver', () => {
  let userRepository: UserRepositoryInterface
  let sessionService: SessionServiceInterace
  let tokenDecoder: TokenDecoderInterface
  let user: User
  let session: Session
  let archivedSession: ArchivedSession

  const createResolver = () => new AuthenticationMethodResolver(userRepository, sessionService, tokenDecoder)

  beforeEach(() => {
    user = {} as jest.Mocked<User>

    session = {} as jest.Mocked<Session>

    archivedSession = {} as jest.Mocked<ArchivedSession>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)

    sessionService = {} as jest.Mocked<SessionServiceInterace>
    sessionService.getSessionFromToken = jest.fn()
    sessionService.getArchivedSessionFromToken = jest.fn()

    tokenDecoder = {} as jest.Mocked<TokenDecoderInterface>
    tokenDecoder.decode = jest.fn()
  })

  it('should resolve jwt authentication method', async () => {
    tokenDecoder.decode = jest.fn().mockReturnValue({ user_uuid: '123' })

    expect(await createResolver().resolve('test')).toEqual({
      claims: {
        user_uuid: '123',
      },
      type: 'jwt',
      user
    })
  })

  it('should resolve session authentication method', async () => {
    sessionService.getSessionFromToken = jest.fn().mockReturnValue(session)

    expect(await createResolver().resolve('test')).toEqual({
      session,
      type: 'session_token',
      user
    })
  })

  it('should resolve archvied session authentication method', async () => {
    sessionService.getArchivedSessionFromToken = jest.fn().mockReturnValue(archivedSession)

    expect(await createResolver().resolve('test')).toEqual({
      archivedSession,
      type: 'archived'
    })
  })

  it('should indicated that authentication method cannot be resolved', async () => {
    expect(await createResolver().resolve('test')).toBeUndefined
  })
})
