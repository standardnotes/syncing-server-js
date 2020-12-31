import 'reflect-metadata'

import * as IORedis from 'ioredis'

import { RedisEphemeralSessionRepository } from './RedisEphemeralSessionRepository'
import { EphemeralSession } from '../../Domain/Session/EphemeralSession'

describe('RedisEphemeralSessionRepository', () => {
  let redisClient: IORedis.Redis

  const createRepository = () => new RedisEphemeralSessionRepository(redisClient, 3600)

  beforeEach(() => {
    redisClient = {} as jest.Mocked<IORedis.Redis>
    redisClient.setex = jest.fn()
    redisClient.del = jest.fn()
    redisClient.get = jest.fn()
  })

  it('should delete an ephemeral session by uuid', async () => {
    await createRepository().deleteOneByUuid('1-2-3')

    expect(redisClient.del).toHaveBeenCalledWith('session:1-2-3')
  })

  it('should save an ephemeral session', async () => {
    const ephemeralSession = new EphemeralSession()
    ephemeralSession.uuid = '1-2-3'
    ephemeralSession.userAgent = 'Mozilla Firefox'
    ephemeralSession.createdAt = new Date(1)
    ephemeralSession.updatedAt = new Date(2)

    await createRepository().save(ephemeralSession)

    expect(redisClient.setex).toHaveBeenCalledWith(
      'session:1-2-3',
      3600,
      '{"uuid":"1-2-3","userAgent":"Mozilla Firefox","createdAt":"1970-01-01T00:00:00.001Z","updatedAt":"1970-01-01T00:00:00.002Z"}'
    )
  })

  it('should find an ephemeral session by uuid', async () => {
    redisClient.get = jest.fn().mockReturnValue('{"uuid":"1-2-3","userAgent":"Mozilla Firefox","createdAt":"1970-01-01T00:00:00.001Z","updatedAt":"1970-01-01T00:00:00.002Z"}')

    const ephemeralSession = <EphemeralSession> await createRepository().findOneByUuid('1-2-3')

    expect(ephemeralSession).not.toBeUndefined()
    expect(ephemeralSession.userAgent).toEqual('Mozilla Firefox')
  })

  it('should return undefined if finding an ephemeral session returns null', async () => {
    redisClient.get = jest.fn().mockReturnValue(null)

    const ephemeralSession = <EphemeralSession> await createRepository().findOneByUuid('1-2-3')

    expect(ephemeralSession).toBeUndefined()
  })

  it('should update tokens and expirations dates', async () => {
    redisClient.get = jest.fn().mockReturnValue('{"uuid":"1-2-3","userAgent":"Mozilla Firefox","createdAt":"1970-01-01T00:00:00.001Z","updatedAt":"1970-01-01T00:00:00.002Z"}')

    await createRepository().updateTokensAndExpirationDates(
      '1-2-3',
      'dummy_access_token',
      'dummy_refresh_token',
      new Date(3),
      new Date(4)
    )

    expect(redisClient.setex).toHaveBeenCalledWith(
      'session:1-2-3',
      3600,
      '{"uuid":"1-2-3","userAgent":"Mozilla Firefox","createdAt":"1970-01-01T00:00:00.001Z","updatedAt":"1970-01-01T00:00:00.002Z","hashedAccessToken":"dummy_access_token","hashedRefreshToken":"dummy_refresh_token","accessExpiration":"1970-01-01T00:00:00.003Z","refreshExpiration":"1970-01-01T00:00:00.004Z"}'
    )
  })

  it('should not update tokens and expirations dates if the ephemeral session does not exist', async () => {
    redisClient.get = jest.fn().mockReturnValue(null)

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
