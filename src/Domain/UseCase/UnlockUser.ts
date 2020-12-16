import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { UnlockUserDTO } from './UnlockUserDTO'
import { UnlockUserResponse } from './UnlockUserResponse'
import { UseCaseInterface } from './UseCaseInterface'

@injectable()
export class UnlockUser implements UseCaseInterface {
  constructor (
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface
  ) {
  }

  async execute(dto: UnlockUserDTO): Promise<UnlockUserResponse> {
    const user = await this.userRepository.findOneByEmail(dto.email)

    if (!user) {
      return { success: false }
    }

    await this.userRepository.resetLockCounters(user.uuid)

    return { success: true }
  }
}
