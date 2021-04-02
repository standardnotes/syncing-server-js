import * as bcrypt from 'bcryptjs'

import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { AuthResponseFactoryResolverInterface } from '../Auth/AuthResponseFactoryResolverInterface'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { SignInDTO } from './SignInDTO'
import { SignInResponse } from './SignInResponse'
import { UseCaseInterface } from './UseCaseInterface'

@injectable()
export class SignIn implements UseCaseInterface {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.AuthResponseFactoryResolver) private authResponseFactoryResolver: AuthResponseFactoryResolverInterface
  ){
  }

  async execute(dto: SignInDTO): Promise<SignInResponse> {
    const user = await this.userRepository.findOneByEmail(dto.email)

    if (user && await bcrypt.compare(dto.password, user.encryptedPassword)) {
      const authResponseFactory = this.authResponseFactoryResolver.resolveAuthResponseFactoryVersion(dto.apiVersion)

      return {
        success: true,
        authResponse: await authResponseFactory.createResponse(
          user,
          dto.apiVersion,
          dto.userAgent,
          dto.ephemeralSession
        ),
      }
    }

    return {
      success: false,
      errorMessage: 'Invalid email or password',
    }
  }
}
