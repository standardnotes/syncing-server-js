import * as bcrypt from 'bcryptjs'
import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { AuthResponseFactoryResolverInterface } from '../Auth/AuthResponseFactoryResolverInterface'

import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { ChangePasswordDTO } from './ChangePasswordDTO'
import { ChangePasswordResponse } from './ChangePasswordResponse'
import { UseCaseInterface } from './UseCaseInterface'

@injectable()
export class ChangePassword implements UseCaseInterface {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.AuthResponseFactoryResolver) private authResponseFactoryResolver: AuthResponseFactoryResolverInterface
  ) {
  }

  async execute(dto: ChangePasswordDTO): Promise<ChangePasswordResponse> {
    if (!await bcrypt.compare(dto.currentPassword, dto.user.encryptedPassword)) {
      return {
        success: false,
        errorMessage: 'The current password you entered is incorrect. Please try again.'
      }
    }

    dto.user.encryptedPassword = await bcrypt.hash(dto.newPassword, User.PASSWORD_HASH_COST)
    dto.user.updatedWithUserAgent = dto.updatedWithUserAgent
    dto.user.pwNonce = dto.pwNonce
    if (dto.protocolVersion) {
      dto.user.version = dto.protocolVersion
    }

    const updatedUser = await this.userRepository.save(dto.user)

    const authResponseFactory = this.authResponseFactoryResolver.resolveAuthResponseFactoryVersion(dto.apiVersion)

    return {
      success: true,
      authResponse: await authResponseFactory.createResponse(updatedUser, dto.apiVersion, dto.updatedWithUserAgent)
    }
  }
}
