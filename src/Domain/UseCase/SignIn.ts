import * as bcrypt from 'bcryptjs'

import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { AuthResponseFactoryInterface } from '../Auth/AuthResponseFactoryInterface'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { SignInDTO } from './SignInDTO'
import { SignInResponse } from './SignInResponse'
import { UseCaseInterface } from './UseCaseInterface'

@injectable()
export class SignIn implements UseCaseInterface {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.AuthResponseFactory) private authResponseFactory: AuthResponseFactoryInterface
  ){
  }

  async execute(dto: SignInDTO): Promise<SignInResponse> {
    const user = await this.userRepository.findOneByEmail(dto.email)

    if (user && await bcrypt.compare(dto.password, user.encryptedPassword)) {
      return {
        success: true,
        authResponse: await this.authResponseFactory.createSuccessAuthResponse(user, dto.apiVersion, dto.userAgent)
      }
    }

    return {
      success: false,
      errorMessage: 'Invalid email or password'
    }
  }
}
