import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { LockRepositoryInterface } from '../User/LockRepositoryInterface'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { IncreaseLoginAttemptsDTO } from './IncreaseLoginAttemptsDTO'
import { IncreaseLoginAttemptsResponse } from './IncreaseLoginAttemptsResponse'
import { UseCaseInterface } from './UseCaseInterface'

@injectable()
export class IncreaseLoginAttempts implements UseCaseInterface {
  constructor (
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.LockRepository) private lockRepository: LockRepositoryInterface,
    @inject(TYPES.MAX_LOGIN_ATTEMPTS) private maxLoginAttempts: number,
    @inject(TYPES.Logger) private logger: Logger
  ) {
  }

  async execute(dto: IncreaseLoginAttemptsDTO): Promise<IncreaseLoginAttemptsResponse> {
    const user = await this.userRepository.findOneByEmail(dto.email)

    if (!user) {
      return { success: false }
    }

    let numberOfFailedAttempts = await this.lockRepository.getLockCounter(user.uuid)

    numberOfFailedAttempts += 1

    this.logger.debug(`User ${user.uuid} has ${user.numberOfFailedAttempts} failed login attempts`)

    await this.lockRepository.updateLockCounter(user.uuid, numberOfFailedAttempts)

    if (numberOfFailedAttempts >= this.maxLoginAttempts) {
      this.logger.debug(`User ${user.uuid} breached number of allowed login attempts. Locking user.`)

      await this.lockRepository.lockUser(user.uuid)
    }

    return { success: true }
  }
}
