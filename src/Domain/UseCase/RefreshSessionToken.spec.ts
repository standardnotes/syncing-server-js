import 'reflect-metadata'

import { Session } from '../Session/Session'
import { SessionRepositoryInterface } from '../Session/SessionRepositoryInterface'
import { SessionServiceInterace } from '../Session/SessionServiceInterface'
import { RefreshSessionToken } from './RefreshSessionToken'

describe('RefreshSessionToken', () => {
  let sessionService: SessionServiceInterace
  let sessionRepository: SessionRepositoryInterface
  let session: Session

  const createUseCase = () => new RefreshSessionToken(
    sessionService,
    sessionRepository,
    123,
    234
  )

  beforeEach(() => {
    session = {} as jest.Mocked<Session>
    session.uuid = '1-2-3'
    session.refreshExpired = jest.fn().mockReturnValue(false)

    sessionService = {} as jest.Mocked<SessionServiceInterace>
    sessionService.isRefreshTokenValid = jest.fn().mockReturnValue(true)
    sessionService.getSessionFromToken = jest.fn().mockReturnValue(session)

    sessionRepository = {} as jest.Mocked<SessionRepositoryInterface>
    sessionRepository.updateHashedTokens = jest.fn()
    sessionRepository.updatedTokenExpirationDates = jest.fn()
  })

  it('should refresh session token', async () => {
    const result = await createUseCase().execute({
      accessToken: '123',
      refreshToken: '234'
    })

    expect(sessionRepository.updateHashedTokens).toHaveBeenCalled()
    expect(sessionRepository.updatedTokenExpirationDates).toHaveBeenCalled()

    expect(result).toEqual({
      success: true,
      sessionPayload: {
        access_expiration: expect.any(Number),
        access_token: expect.any(String),
        refresh_expiration: expect.any(Number),
        refresh_token: expect.any(String)
      }
    })
  })

  it('should not refresh a session token if session is not found', async () => {
    sessionService.getSessionFromToken = jest.fn().mockReturnValue(null)

    const result = await createUseCase().execute({
      accessToken: '123',
      refreshToken: '234'
    })

    expect(result).toEqual({
      success: false,
      errorTag: 'invalid-parameters',
      errorMessage: 'The provided parameters are not valid.'
    })
  })

  it('should not refresh a session token if refresh token is not valid', async () => {
    sessionService.isRefreshTokenValid = jest.fn().mockReturnValue(false)

    const result = await createUseCase().execute({
      accessToken: '123',
      refreshToken: '234'
    })

    expect(result).toEqual({
      success: false,
      errorTag: 'invalid-refresh-token',
      errorMessage: 'The refresh token is not valid.'
    })
  })

  it('should not refresh a session token if refresh token is expired', async () => {
    session.refreshExpired = jest.fn().mockReturnValue(true)

    const result = await createUseCase().execute({
      accessToken: '123',
      refreshToken: '234'
    })

    expect(result).toEqual({
      success: false,
      errorTag: 'expired-refresh-token',
      errorMessage: 'The refresh token has expired.',
    })
  })
})
