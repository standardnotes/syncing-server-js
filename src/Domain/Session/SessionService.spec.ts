import 'reflect-metadata'
import * as winston from 'winston'
import DeviceDetector = require('device-detector-js')

import { Session } from './Session'
import { SessionRepositoryInterface } from './SessionRepositoryInterface'
import { SessionService } from './SessionService'

describe('SessionService', () => {
  let sessionRepository: SessionRepositoryInterface
  let session: Session
  let deviceDetector: DeviceDetector
  let logger: winston.Logger

  const createService = () => new SessionService(sessionRepository, deviceDetector, logger)

  beforeEach(() => {
    sessionRepository = {} as jest.Mocked<SessionRepositoryInterface>
    sessionRepository.findOneByUuid = jest.fn()

    session = {} as jest.Mocked<Session>
    session.userAgent = 'Chrome'
    session.hashedAccessToken = '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce'

    deviceDetector = {} as jest.Mocked<DeviceDetector>
    deviceDetector.parse = jest.fn().mockReturnValue({
      'client': {
        'type': 'browser',
        'name': 'Chrome',
        'version': '69.0',
        'engine': 'Blink',
        'engineVersion': ''
      },
      'os': {
        'name': 'Mac',
        'version': '10.13',
        'platform': ''
      },
      'device': {
        'type': 'desktop',
        'brand': 'Apple',
        'model': ''
      },
      'bot': null
    })

    logger = {} as jest.Mocked<winston.Logger>
    logger.warning = jest.fn()
  })

  it('should return device info based on user agent', () => {
    expect(createService().getDeviceInfo(session)).toEqual('Chrome 69.0 on Mac 10.13')
  })

  it('should return device info based on undefined user agent', () => {
    deviceDetector.parse = jest.fn().mockReturnValue({
      'device': {
        'type': 'desktop',
        'brand': 'Apple',
        'model': ''
      },
      'bot': null
    })
    expect(createService().getDeviceInfo(session)).toEqual('undefined undefined on undefined undefined')
  })

  it('should return device info fallback to user agent', () => {
    deviceDetector.parse = jest.fn().mockImplementation(() => {
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
})
