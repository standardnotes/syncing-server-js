import * as IORedis from 'ioredis'

import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { ServiceTransitionHelperInterface } from '../../Domain/Transition/ServiceTransitionHelperInterface'

@injectable()
export class RedisServiceTransitionHelper implements ServiceTransitionHelperInterface {
  private readonly MFA_PREFIX = 'mfa'
  private readonly MFA_UPDATED_AT_PREFIX = 'mfa_ua'

  constructor(
    @inject(TYPES.Redis) private redisClient: IORedis.Redis,
  ) {
  }

  async deleteUserMFAAsUserSetting(userUuid: string): Promise<void> {
    await this.redisClient.del(`${this.MFA_PREFIX}:${userUuid}`)
    await this.redisClient.del(`${this.MFA_UPDATED_AT_PREFIX}:${userUuid}`)
  }

  async userHasMovedMFAToUserSettings(userUuid: string): Promise<boolean> {
    const mfaInUserSettings = await this.redisClient.get(`${this.MFA_PREFIX}:${userUuid}`)

    return mfaInUserSettings !== null && +mfaInUserSettings === 1
  }

  async markUserMFAAsMovedToUserSettings(userUuid: string, updatedAt: number): Promise<void> {
    await this.redisClient.set(`${this.MFA_PREFIX}:${userUuid}`, 1)
    await this.redisClient.set(`${this.MFA_UPDATED_AT_PREFIX}:${userUuid}`, updatedAt)
  }

  async getUserMFAUpdatedAtTimestamp(userUuid: string): Promise<number> {
    const timestamp = this.redisClient.get(`${this.MFA_UPDATED_AT_PREFIX}:${userUuid}`)

    return +timestamp
  }
}
