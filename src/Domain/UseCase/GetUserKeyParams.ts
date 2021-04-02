import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { KeyParamsFactoryInterface } from '../User/KeyParamsFactoryInterface'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { GetUserKeyParamsDTO } from './GetUserKeyParamsDTO'
import { GetUserKeyParamsResponse } from './GetUserKeyParamsResponse'
import { UseCaseInterface } from './UseCaseInterface'

@injectable()
export class GetUserKeyParams implements UseCaseInterface {
  constructor (
    @inject(TYPES.KeyParamsFactory) private keyParamsFactory: KeyParamsFactoryInterface,
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface
  ) {
  }

  async execute(dto: GetUserKeyParamsDTO): Promise<GetUserKeyParamsResponse> {
    if (dto.authenticatedUser) {
      return {
        keyParams: this.keyParamsFactory.create(dto.authenticatedUser, true),
      }
    }

    const user = await this.userRepository.findOneByEmail(dto.email)
    if (!user) {
      return {
        keyParams: this.keyParamsFactory.createPseudoParams(dto.email),
      }
    }

    return {
      keyParams: this.keyParamsFactory.create(user, false),
    }
  }
}
