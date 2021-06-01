import * as IORedis from 'ioredis'

import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { EphemeralSession } from '../../Domain/Session/EphemeralSession'
import { EphemeralSessionRepositoryInterface } from '../../Domain/Session/EphemeralSessionRepositoryInterface'

@injectable()
export class RedisEphemeralSessionRepository implements EphemeralSessionRepositoryInterface {
  private readonly PREFIX = 'session'

  constructor(
    @inject(TYPES.Redis) private redisClient: IORedis.Redis,
    @inject(TYPES.EPHEMERAL_SESSION_AGE) private ephemeralSessionAge: number
  ) {
  }

  async deleteOne(uuid: string, userUuid: string): Promise<void> {
    await this.redisClient.del(`${this.PREFIX}:${uuid}`)
    await this.redisClient.del(`${this.PREFIX}:${uuid}:${userUuid}`)
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

  async findOneByUuid(uuid: string): Promise<EphemeralSession | undefined> {
    const stringifiedSession = await this.redisClient.get(`${this.PREFIX}:${uuid}`)
    if (!stringifiedSession) {
      return undefined
    }

    return JSON.parse(stringifiedSession)
  }

  async save(ephemeralSession: EphemeralSession): Promise<void> {
    const bySessionAndUserKey = `${this.PREFIX}:${ephemeralSession.uuid}:${ephemeralSession.userUuid}`
    const bySessionKey = `${this.PREFIX}:${ephemeralSession.uuid}`

    const ttl = this.ephemeralSessionAge

    const stringifiedSession = JSON.stringify(ephemeralSession)

    await this.redisClient.setex(bySessionAndUserKey, ttl, stringifiedSession)
    await this.redisClient.setex(bySessionKey, ttl, stringifiedSession)
  }
}
