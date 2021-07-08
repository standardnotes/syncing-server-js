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

  async markUserMFAAsUserSettingAsDeleted(userUuid: string, updatedAt: number): Promise<void> {
    await this.redisClient.set(`${this.MFA_PREFIX}:${userUuid}`, 0)
    await this.redisClient.set(`${this.MFA_UPDATED_AT_PREFIX}:${userUuid}`, updatedAt)
  }

  async userHasMovedMFAToUserSettings(userUuid: string): Promise<{ status: 'active' | 'deleted' | 'not found' }> {
    const mfaInUserSettings = await this.redisClient.get(`${this.MFA_PREFIX}:${userUuid}`)

    if (mfaInUserSettings === null) {
      return { status: 'not found' }
    }

    switch (+mfaInUserSettings) {
    case 1:
      return { status: 'active' }
    case 0:
    default:
      return { status: 'deleted' }
    }
  }

  async markUserMFAAsMovedToUserSettings(userUuid: string, updatedAt: number): Promise<void> {
    await this.redisClient.set(`${this.MFA_PREFIX}:${userUuid}`, 1)
    await this.redisClient.set(`${this.MFA_UPDATED_AT_PREFIX}:${userUuid}`, updatedAt)
  }

  async getUserMFAUpdatedAtTimestamp(userUuid: string): Promise<number> {
    const timestamp = await this.redisClient.get(`${this.MFA_UPDATED_AT_PREFIX}:${userUuid}`)

    if (timestamp !== null) {
      return +timestamp
    }

    return 0
  }
}
