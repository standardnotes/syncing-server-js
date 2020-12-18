import * as dayjs from 'dayjs'

import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { IncreaseLoginAttemptsDTO } from './IncreaseLoginAttemptsDTO'
import { IncreaseLoginAttemptsResponse } from './IncreaseLoginAttemptsResponse'
import { UseCaseInterface } from './UseCaseInterface'

@injectable()
export class IncreaseLoginAttempts implements UseCaseInterface {
  constructor (
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.MAX_LOGIN_ATTEMPTS) private maxLoginAttempts: number,
    @inject(TYPES.FAILED_LOGIN_LOCKOUT) private failedLoginLockout: number,
    @inject(TYPES.Logger) private logger: Logger
  ) {
  }

  async execute(dto: IncreaseLoginAttemptsDTO): Promise<IncreaseLoginAttemptsResponse> {
    const user = await this.userRepository.findOneByEmail(dto.email)

    if (!user) {
      return { success: false }
    }

    if (!user.numberOfFailedAttempts) {
      user.numberOfFailedAttempts = 0
    }
    user.numberOfFailedAttempts += 1

    this.logger.debug(`User ${user.uuid} has ${user.numberOfFailedAttempts} failed login attempts`)

    if (user.numberOfFailedAttempts >= this.maxLoginAttempts) {
      this.logger.debug(`User ${user.uuid} breached number of allowed login attempts. Locking user.`)

      user.numberOfFailedAttempts = 0
      await this.userRepository.lockUntil(user.uuid, dayjs.utc().add(this.failedLoginLockout, 'second').toDate())

      return { success: true }
    }

    await this.userRepository.updateLockCounter(user.uuid, user.numberOfFailedAttempts)

    return { success: true }
  }
}
