import * as dayjs from 'dayjs'
import * as bcrypt from 'bcryptjs'

import { v4 as uuidv4 } from 'uuid'
import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { RegisterDTO } from './RegisterDTO'
import { RegisterResponse } from './RegisterResponse'
import { UseCaseInterface } from './UseCaseInterface'
import { AuthResponseFactoryResolverInterface } from '../Auth/AuthResponseFactoryResolverInterface'

@injectable()
export class Register implements UseCaseInterface {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.AuthResponseFactoryResolver) private authResponseFactoryResolver: AuthResponseFactoryResolverInterface,
    @inject(TYPES.DISABLE_USER_REGISTRATION) private disableUserRegistration: boolean
  ) {
  }

  async execute(dto: RegisterDTO): Promise<RegisterResponse> {
    if (this.disableUserRegistration) {
      return {
        success: false,
        errorMessage: 'User registration is currently not allowed.'
      }
    }

    const { email, password, apiVersion, ephemeralSession, ...registrationFields } = dto

    const existingUser = await this.userRepository.findOneByEmail(email)
    if (existingUser) {
      return {
        success: false,
        errorMessage: 'This email is already registered.'
      }
    }

    let user = new User()
    user.uuid = uuidv4()
    user.email = email
    user.createdAt = dayjs.utc().toDate()
    user.updatedAt = dayjs.utc().toDate()
    user.encryptedPassword = await bcrypt.hash(password, User.PASSWORD_HASH_COST)

    Object.assign(user, registrationFields)

    user = await this.userRepository.save(user)

    const authResponseFactory = this.authResponseFactoryResolver.resolveAuthResponseFactoryVersion(apiVersion)

    return {
      success: true,
      authResponse: await authResponseFactory.createResponse(
        user,
        apiVersion,
        dto.updatedWithUserAgent,
        ephemeralSession
      )
    }
  }
}
