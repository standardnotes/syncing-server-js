import 'reflect-metadata'

import * as IORedis from 'ioredis'

import { RedisEphemeralSessionRepository } from './RedisEphemeralSessionRepository'
import { EphemeralSession } from '../../Domain/Session/EphemeralSession'
import { Logger } from 'winston'

describe('RedisEphemeralSessionRepository', () => {
  let redisClient: IORedis.Redis
  let logger: Logger

  const createRepository = () => new RedisEphemeralSessionRepository(redisClient, 3600, logger)

  beforeEach(() => {
    redisClient = {} as jest.Mocked<IORedis.Redis>
    redisClient.setex = jest.fn()
    redisClient.del = jest.fn()
    redisClient.scan = jest.fn()
    redisClient.get = jest.fn()
    redisClient.mget = jest.fn()

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
  })

  it('should delete an ephemeral session by uuid', async () => {
    redisClient.scan = jest.fn().mockReturnValue(['0', ['session:1-2-3:2-3-4']])

    await createRepository().deleteOneByUuid('1-2-3')

    expect(redisClient.del).toHaveBeenCalledWith('session:1-2-3:2-3-4')
  })

  it('should not delete an ephemeral session if it cannot be found', async () => {
    redisClient.scan = jest.fn().mockReturnValue(['0', []])

    await createRepository().deleteOneByUuid('1-2-3')

    expect(redisClient.del).not.toHaveBeenCalled()
  })

  it('should save an ephemeral session', async () => {
    const ephemeralSession = new EphemeralSession()
    ephemeralSession.uuid = '1-2-3'
    ephemeralSession.userUuid = '2-3-4'
    ephemeralSession.userAgent = 'Mozilla Firefox'
    ephemeralSession.createdAt = new Date(1)
    ephemeralSession.updatedAt = new Date(2)

    await createRepository().save(ephemeralSession)

    expect(redisClient.setex).toHaveBeenCalledWith(
      'session:1-2-3:2-3-4',
      3600,
      '{"uuid":"1-2-3","userUuid":"2-3-4","userAgent":"Mozilla Firefox","createdAt":"1970-01-01T00:00:00.001Z","updatedAt":"1970-01-01T00:00:00.002Z"}'
    )
  })

  it('should find all ephemeral sessions by user uuid', async () => {
    redisClient.scan = jest.fn()
      .mockReturnValueOnce(['1', ['session:1-2-3:2-3-4']])
      .mockReturnValueOnce(['0', ['session:2-3-4:2-3-4']])

    redisClient.mget = jest.fn().mockReturnValue([
      '{"uuid":"1-2-3","userUuid":"2-3-4","userAgent":"Mozilla Firefox","createdAt":"1970-01-01T00:00:00.001Z","updatedAt":"1970-01-01T00:00:00.002Z"}',
      '{"uuid":"2-3-4","userUuid":"2-3-4","userAgent":"Google Chrome","createdAt":"1970-01-01T00:00:00.001Z","updatedAt":"1970-01-01T00:00:00.002Z"}',
    ])

    const ephemeralSessions = await createRepository().findAllByUserUuid('2-3-4')

    expect(ephemeralSessions.length).toEqual(2)
    expect(ephemeralSessions[1].userAgent).toEqual('Google Chrome')
  })

  it('should not look for ephemeral sessions if keys are not found', async () => {
    redisClient.scan = jest.fn()
      .mockReturnValueOnce(['0', []])

    const ephemeralSessions = await createRepository().findAllByUserUuid('2-3-4')

    expect(redisClient.mget).not.toHaveBeenCalled()
    expect(ephemeralSessions.length).toEqual(0)
  })

  it('should find an ephemeral session by uuid', async () => {
    redisClient.scan = jest.fn().mockReturnValue(['0', ['session:1-2-3:2-3-4']])
    redisClient.get = jest.fn().mockReturnValue('{"uuid":"1-2-3","userUuid":"2-3-4","userAgent":"Mozilla Firefox","createdAt":"1970-01-01T00:00:00.001Z","updatedAt":"1970-01-01T00:00:00.002Z"}')

    const ephemeralSession = <EphemeralSession> await createRepository().findOneByUuid('1-2-3')

    expect(ephemeralSession).not.toBeUndefined()
    expect(ephemeralSession.userAgent).toEqual('Mozilla Firefox')
  })

  it('should return undefined if session is not found', async () => {
    redisClient.scan = jest.fn().mockReturnValue(['0', []])

    const ephemeralSession = <EphemeralSession> await createRepository().findOneByUuid('1-2-3')

    expect(ephemeralSession).toBeUndefined()
  })

  it('should return undefined if session fails to retrieve', async () => {
    redisClient.scan = jest.fn().mockReturnValue(['0', ['session:1-2-3:2-3-4']])
    redisClient.get = jest.fn().mockReturnValue(null)

    const ephemeralSession = <EphemeralSession> await createRepository().findOneByUuid('1-2-3')

    expect(ephemeralSession).toBeUndefined()
  })

  it('should update tokens and expirations dates', async () => {
    redisClient.scan = jest.fn().mockReturnValue(['0', ['session:1-2-3:2-3-4']])
    redisClient.get = jest.fn().mockReturnValue('{"uuid":"1-2-3","userUuid":"2-3-4","userAgent":"Mozilla Firefox","createdAt":"1970-01-01T00:00:00.001Z","updatedAt":"1970-01-01T00:00:00.002Z"}')

    await createRepository().updateTokensAndExpirationDates(
      '1-2-3',
      'dummy_access_token',
      'dummy_refresh_token',
      new Date(3),
      new Date(4)
    )

    expect(redisClient.setex).toHaveBeenCalledWith(
      'session:1-2-3:2-3-4',
      3600,
      '{"uuid":"1-2-3","userUuid":"2-3-4","userAgent":"Mozilla Firefox","createdAt":"1970-01-01T00:00:00.001Z","updatedAt":"1970-01-01T00:00:00.002Z","hashedAccessToken":"dummy_access_token","hashedRefreshToken":"dummy_refresh_token","accessExpiration":"1970-01-01T00:00:00.003Z","refreshExpiration":"1970-01-01T00:00:00.004Z"}'
    )
  })

  it('should not update tokens and expirations dates if the ephemeral session does not exist', async () => {
    redisClient.scan = jest.fn().mockReturnValue(['0', []])

    await createRepository().updateTokensAndExpirationDates(
      '1-2-3',
      'dummy_access_token',
      'dummy_refresh_token',
      new Date(3),
      new Date(4)
    )

    expect(redisClient.setex).not.toHaveBeenCalled()
  })
})
