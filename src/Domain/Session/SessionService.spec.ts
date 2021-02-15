import 'reflect-metadata'
import * as winston from 'winston'

import { Session } from './Session'
import { SessionRepositoryInterface } from './SessionRepositoryInterface'
import { SessionService } from './SessionService'
import { User } from '../User/User'
import { EphemeralSessionRepositoryInterface } from './EphemeralSessionRepositoryInterface'
import { EphemeralSession } from './EphemeralSession'
import { RevokedSessionRepositoryInterface } from './RevokedSessionRepositoryInterface'
import { RevokedSession } from './RevokedSession'

describe('SessionService', () => {
  let sessionRepository: SessionRepositoryInterface
  let ephemeralSessionRepository: EphemeralSessionRepositoryInterface
  let revokedSessionRepository: RevokedSessionRepositoryInterface
  let session: Session
  let ephemeralSession: EphemeralSession
  let revokedSession: RevokedSession
  let deviceDetector: UAParser
  let logger: winston.Logger

  const createService = () => new SessionService(
    sessionRepository,
    ephemeralSessionRepository,
    revokedSessionRepository,
    deviceDetector,
    logger,
    123,
    234
  )

  beforeEach(() => {
    session = {} as jest.Mocked<Session>
    session.uuid = '2e1e43'
    session.userUuid = '1-2-3'
    session.userAgent = 'Chrome'
    session.hashedAccessToken = '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce'
    session.hashedRefreshToken = '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce'

    revokedSession = {} as jest.Mocked<RevokedSession>
    revokedSession.uuid = '2e1e43'

    sessionRepository = {} as jest.Mocked<SessionRepositoryInterface>
    sessionRepository.findOneByUuid = jest.fn()
    sessionRepository.deleteOneByUuid = jest.fn()
    sessionRepository.save = jest.fn().mockReturnValue(session)
    sessionRepository.updateHashedTokens = jest.fn()
    sessionRepository.updatedTokenExpirationDates = jest.fn()

    ephemeralSessionRepository = {} as jest.Mocked<EphemeralSessionRepositoryInterface>
    ephemeralSessionRepository.save = jest.fn()
    ephemeralSessionRepository.findOneByUuid = jest.fn()
    ephemeralSessionRepository.updateTokensAndExpirationDates = jest.fn()
    ephemeralSessionRepository.deleteOneByUuid = jest.fn()

    revokedSessionRepository = {} as jest.Mocked<RevokedSessionRepositoryInterface>
    revokedSessionRepository.save = jest.fn()

    ephemeralSession = {} as jest.Mocked<EphemeralSession>
    ephemeralSession.uuid = '2-3-4'
    ephemeralSession.userAgent = 'Mozilla Firefox'
    ephemeralSession.hashedAccessToken = '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce'
    ephemeralSession.hashedRefreshToken = '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce'

    deviceDetector = {} as jest.Mocked<UAParser>
    deviceDetector.setUA = jest.fn().mockReturnThis()
    deviceDetector.getResult = jest.fn().mockReturnValue({
      'browser': {
        'name': 'Chrome',
        'version': '69.0'
      },
      'os': {
        'name': 'Mac',
        'version': '10.13'
      }
    })

    logger = {} as jest.Mocked<winston.Logger>
    logger.warning = jest.fn()
    logger.error = jest.fn()
    logger.debug = jest.fn()
  })

  it('should mark a revoked session as received', async () => {
    await createService().markRevokedSessionAsReceived(revokedSession)

    expect(revokedSessionRepository.save).toHaveBeenCalledWith({
      uuid: '2e1e43',
      received: true
    })
  })

  it('should create access and refresh tokens for a session', async () => {
    expect(await createService().createTokens(session)).toEqual({
      access_expiration: expect.any(Number),
      access_token: expect.any(String),
      refresh_token: expect.any(String),
      refresh_expiration: expect.any(Number),
    })

    expect(sessionRepository.updateHashedTokens).toHaveBeenCalled()
    expect(sessionRepository.updatedTokenExpirationDates).toHaveBeenCalled()
  })

  it('should create new session for a user', async () => {
    const user = {} as jest.Mocked<User>
    user.uuid = '123'

    const createdSession = await createService().createNewSessionForUser(user, '003', 'Google Chrome')

    expect(createdSession).toEqual(session)
  })

  it('should create new ephemeral session for a user', async () => {
    const user = {} as jest.Mocked<User>
    user.uuid = '123'

    const createdSession = await createService().createNewEphemeralSessionForUser(user, '003', 'Google Chrome')

    expect(createdSession).toBeInstanceOf(EphemeralSession)
    expect(createdSession.userUuid).toEqual(user.uuid)
    expect(createdSession.userAgent).toEqual('Google Chrome')
  })

  it('should delete a session by token', async () => {
    sessionRepository.findOneByUuid = jest.fn().mockImplementation((uuid) => {
      if (uuid === '2') {
        return session
      }

      return undefined
    })

    await createService().deleteSessionByToken('1:2:3')

    expect(sessionRepository.deleteOneByUuid).toHaveBeenCalledWith('2e1e43')
    expect(ephemeralSessionRepository.deleteOneByUuid).toHaveBeenCalledWith('2e1e43')
  })

  it('should not delete a session by token if session is not found', async () => {
    sessionRepository.findOneByUuid = jest.fn().mockImplementation((uuid) => {
      if (uuid === '2') {
        return session
      }

      return undefined
    })

    await createService().deleteSessionByToken('1:4:3')

    expect(sessionRepository.deleteOneByUuid).not.toHaveBeenCalled()
    expect(ephemeralSessionRepository.deleteOneByUuid).not.toHaveBeenCalled()
  })

  it('should determine if a refresh token is valid', async () => {
    expect(createService().isRefreshTokenValid(session, '1:2:3')).toBeTruthy()
    expect(createService().isRefreshTokenValid(session, '1:2:4')).toBeFalsy()
    expect(createService().isRefreshTokenValid(session, '1:2')).toBeFalsy()
  })

  it('should return device info based on user agent', () => {
    expect(createService().getDeviceInfo(session)).toEqual('Chrome 69.0 on Mac 10.13')
  })

  it('should return device info based on undefined user agent', () => {
    deviceDetector.getResult = jest.fn().mockReturnValue({
      browser: { name: '', version: '' },
      os: { name: '', version: '' }
    })
    expect(createService().getDeviceInfo(session)).toEqual('Unknown Client on Unknown OS')
  })

  it('should return a shorter info based on lack of client in user agent', () => {
    deviceDetector.getResult = jest.fn().mockReturnValue({
      browser: { name: '', version: '' },
      os: { name: 'iOS', version: '10.3' }
    })

    expect(createService().getDeviceInfo(session)).toEqual('iOS 10.3')
  })

  it('should return a shorter info based on lack of os in user agent', () => {
    deviceDetector.getResult = jest.fn().mockReturnValue({
      browser: { name: 'Chrome', version: '69.0' },
      os: { name: '', version: '' },
    })

    expect(createService().getDeviceInfo(session)).toEqual('Chrome 69.0')
  })

  it('should return a shorter info based on partial os in user agent', () => {
    deviceDetector.getResult = jest.fn().mockReturnValue({
      browser: { name: 'Chrome', version: '69.0' },
      os: { name: 'Windows', version: '' }
    })

    expect(createService().getDeviceInfo(session)).toEqual('Chrome 69.0 on Windows')

    deviceDetector.getResult = jest.fn().mockReturnValue({
      browser: { name: 'Chrome', version: '69.0' },
      os: { name: '', version: '7' }
    })

    expect(createService().getDeviceInfo(session)).toEqual('Chrome 69.0 on 7')
  })

  it('should return a shorter info based on partial client in user agent', () => {
    deviceDetector.getResult = jest.fn().mockReturnValue({
      browser: { name: '', version: '69.0' },
      os: { name: 'Windows', version: '7' }
    })

    expect(createService().getDeviceInfo(session)).toEqual('69.0 on Windows 7')

    deviceDetector.getResult = jest.fn().mockReturnValue({
      browser: { name: 'Chrome', version: '' },
      os: { name: 'Windows', version: '7' }
    })

    expect(createService().getDeviceInfo(session)).toEqual('Chrome on Windows 7')
  })

  it('should return a shorter info based on partial client and partial os in user agent', () => {
    deviceDetector.getResult = jest.fn().mockReturnValue({
      browser: { name: '', version: '69.0' },
      os: { name: 'Windows', version: '' }
    })

    expect(createService().getDeviceInfo(session)).toEqual('69.0 on Windows')

    deviceDetector.getResult = jest.fn().mockReturnValue({
      browser: { name: 'Chrome', version: '' },
      os: { name: '', version: '7' }
    })

    expect(createService().getDeviceInfo(session)).toEqual('Chrome on 7')
  })

  it('should return only Android os for okHttp client', () => {
    deviceDetector.getResult = jest.fn().mockReturnValue({
      browser: { name: 'okHttp', version: '3.14' },
      os: { name: 'Android', version: '' }
    })

    expect(createService().getDeviceInfo(session)).toEqual('Android')
  })

  it('should return device info fallback to user agent', () => {
    deviceDetector.getResult = jest.fn().mockImplementation(() => {
      throw new Error('something bad happened')
    })

    expect(createService().getDeviceInfo(session)).toEqual('Chrome')
  })

  it('should retrieve a session from a session token', async () => {
    sessionRepository.findOneByUuid = jest.fn().mockImplementation((uuid) => {
      if (uuid === '2') {
        return session
      }

      return undefined
    })

    const result = await createService().getSessionFromToken('1:2:3')

    expect(result).toEqual(session)
  })

  it('should retrieve an ephemeral session from a session token', async () => {
    ephemeralSessionRepository.findOneByUuid = jest.fn().mockReturnValue(ephemeralSession)
    sessionRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    const result = await createService().getSessionFromToken('1:2:3')

    expect(result).toEqual(ephemeralSession)
  })

  it('should not retrieve a session from a session token that has access token missing', async () => {
    sessionRepository.findOneByUuid = jest.fn().mockImplementation((uuid) => {
      if (uuid === '2') {
        return session
      }

      return undefined
    })

    const result = await createService().getSessionFromToken('1:2')

    expect(result).toBeUndefined()
  })

  it('should not retrieve a session that is missing', async () => {
    sessionRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    const result = await createService().getSessionFromToken('1:2:3')

    expect(result).toBeUndefined()
  })

  it('should not retrieve a session from a session token that has invalid access token', async () => {
    sessionRepository.findOneByUuid = jest.fn().mockImplementation((uuid) => {
      if (uuid === '2') {
        return session
      }

      return undefined
    })

    const result = await createService().getSessionFromToken('1:2:4')

    expect(result).toBeUndefined()
  })

  it('should revoked a session', async () => {
    await createService().revokeSession(session)

    expect(revokedSessionRepository.save).toHaveBeenCalledWith({
      uuid: '2e1e43',
      userUuid: '1-2-3',
      createdAt: expect.any(Date)
    })
  })

  it('should retrieve an archvied session from a session token', async () => {
    revokedSessionRepository.findOneByUuid = jest.fn().mockReturnValue(revokedSession)

    const result = await createService().getRevokedSessionFromToken('1:2:3')

    expect(result).toEqual(revokedSession)
  })

  it('should not retrieve an archvied session if session id is missing from token', async () => {
    revokedSessionRepository.findOneByUuid = jest.fn()

    const result = await createService().getRevokedSessionFromToken('1::3')

    expect(result).toBeUndefined()
  })
})
