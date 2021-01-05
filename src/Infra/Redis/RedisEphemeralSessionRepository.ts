import * as IORedis from 'ioredis'

import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { EphemeralSession } from '../../Domain/Session/EphemeralSession'
import { EphemeralSessionRepositoryInterface } from '../../Domain/Session/EphemeralSessionRepositoryInterface'
import { Logger } from 'winston'

@injectable()
export class RedisEphemeralSessionRepository implements EphemeralSessionRepositoryInterface {
  private readonly PREFIX = 'session'

  constructor(
    @inject(TYPES.Redis) private redisClient: IORedis.Redis,
    @inject(TYPES.EPHEMERAL_SESSION_AGE) private ephemeralSessionAge: number,
    @inject(TYPES.Logger) private logger: Logger
  ) {
  }

  async deleteOneByUuid(uuid: string): Promise<void> {
    const sessionKeys = await this.findKeysByUuid(uuid)

    await this.redisClient.del(sessionKeys[0])
  }

  async updateTokensAndExpirationDates(uuid: string, hashedAccessToken: string, hashedRefreshToken: string, accessExpiration: Date, refreshExpiration: Date): Promise<void> {
    const session = await this.findOneByUuid(uuid)
    if (!session) {
      return
    }

    session.hashedAccessToken = hashedAccessToken
    session.hashedRefreshToken = hashedRefreshToken
    session.accessExpiration = accessExpiration
    session.refreshExpiration = refreshExpiration

    await this.save(session)
  }

  async findAllByUserUuid(userUuid: string): Promise<Array<EphemeralSession>> {
    let cursor = '0'
    let sessionKeys: Array<string> = []
    do {
      const scanResult = await this.redisClient.scan(
        cursor,
        'MATCH',
        `${this.PREFIX}:*:${userUuid}`
      )
      this.logger.debug('Scan result: %O', scanResult)

      cursor = scanResult[0]
      sessionKeys = sessionKeys.concat(scanResult[1])
    } while (cursor !== '0')

    if (!sessionKeys.length) {
      return []
    }

    const sessions = await this.redisClient.mget(sessionKeys)

    return (<string[]> sessions.filter(value => value)).map(stringifiedSession => JSON.parse(stringifiedSession))
  }

  async findOneByUuid(uuid: string): Promise<EphemeralSession | undefined> {
    const sessionKeys = await this.findKeysByUuid(uuid)

    if (!sessionKeys.length) {
      return undefined
    }

    const stringifiedSession = await this.redisClient.get(sessionKeys[0])
    if (!stringifiedSession) {
      return undefined
    }

    return JSON.parse(stringifiedSession)
  }

  async save(ephemeralSession: EphemeralSession): Promise<void> {
    await this.redisClient.setex(
      `${this.PREFIX}:${ephemeralSession.uuid}:${ephemeralSession.userUuid}`,
      this.ephemeralSessionAge,
      JSON.stringify(ephemeralSession)
    )
  }

  private async findKeysByUuid(uuid: string): Promise<Array<string>> {
    let cursor = '0'
    let sessionKeys: Array<string> = []
    do {
      const scanResult = await this.redisClient.scan(
        cursor,
        'MATCH',
        `${this.PREFIX}:${uuid}:*`
      )
      this.logger.debug('Scan result: %O', scanResult)

      cursor = scanResult[0]
      sessionKeys = sessionKeys.concat(scanResult[1])
    } while (cursor !== '0')

    return sessionKeys.filter(key => key)
  }
}
