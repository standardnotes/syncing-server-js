import * as IORedis from 'ioredis'

import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { LockRepositoryInterface } from '../../Domain/User/LockRepositoryInterface'

@injectable()
export class LockRepository implements LockRepositoryInterface {
  private readonly PREFIX = 'lock'

  constructor(
    @inject(TYPES.Redis) private redisClient: IORedis.Redis,
    @inject(TYPES.MAX_LOGIN_ATTEMPTS) private maxLoginAttempts: number,
    @inject(TYPES.FAILED_LOGIN_LOCKOUT) private failedLoginLockout: number
  ) {
  }

  async resetLockCounter(userUuid: string): Promise<void> {
    await this.redisClient.del(`${this.PREFIX}:${userUuid}`)
  }

  async updateLockCounter(userUuid: string, counter: number): Promise<void> {
    await this.redisClient.set(`${this.PREFIX}:${userUuid}`, counter)
  }

  async getLockCounter(userUuid: string): Promise<number> {
    const counter = await this.redisClient.get(`${this.PREFIX}:${userUuid}`)

    if (!counter) {
      return 0
    }

    return +counter
  }

  async lockUser(userUuid: string): Promise<void> {
    await this.redisClient.expire(`${this.PREFIX}:${userUuid}`, this.failedLoginLockout)
  }

  async isUserLocked(userUuid: string): Promise<boolean> {
    const counter = await this.getLockCounter(userUuid)

    return counter >= this.maxLoginAttempts
  }
}
