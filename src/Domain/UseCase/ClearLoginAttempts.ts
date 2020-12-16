import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { ClearLoginAttemptsDTO } from './ClearLoginAttemptsDTO'
import { ClearLoginAttemptsResponse } from './ClearLoginAttemptsResponse'
import { UseCaseInterface } from './UseCaseInterface'

@injectable()
export class ClearLoginAttempts implements UseCaseInterface {
  constructor (
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface
  ) {
  }

  async execute(dto: ClearLoginAttemptsDTO): Promise<ClearLoginAttemptsResponse> {
    const user = await this.userRepository.findOneByEmail(dto.email)

    if (!user) {
      return { success: false }
    }

    await this.userRepository.resetLockCounter(user.uuid)

    return { success: true }
  }
}
