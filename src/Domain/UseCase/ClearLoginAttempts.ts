import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { ClearLoginAttemptsDTO } from './ClearLoginAttemptsDTO'
import { ClearLoginAttemptsResponse } from './ClearLoginAttemptsResponse'
import { UseCaseInterface } from './UseCaseInterface'

@injectable()
export class ClearLoginAttempts implements UseCaseInterface {
  constructor (
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.Logger) private logger: Logger
  ) {
  }

  async execute(dto: ClearLoginAttemptsDTO): Promise<ClearLoginAttemptsResponse> {
    const user = await this.userRepository.findOneByEmail(dto.email)

    if (!user) {
      return { success: false }
    }

    this.logger.debug(`Resetting lock counter for user ${user.uuid}`)

    await this.userRepository.resetLockCounter(user.uuid)

    return { success: true }
  }
}
