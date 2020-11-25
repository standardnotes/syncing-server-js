import * as crypto from 'crypto'
import { inject, injectable } from 'inversify'

import { verify } from 'jsonwebtoken'
import TYPES from '../../Bootstrap/Types'
import { AuthenticationMethod } from '../Auth/AuthenticationMethod'
import { Session } from '../Session/Session'
import { SessionRepositoryInterface } from '../Session/SessionRepositoryInterface'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'

import { AuthenticateUserDTO } from './AuthenticateUserDTO'
import { AuthenticateUserResponse } from './AuthenticateUserResponse'

@injectable()
export class AuthenticateUser {
  constructor(
    @inject(TYPES.JWT_SECRET) private jwtSecret: string,
    @inject(TYPES.LEGACY_JWT_SECRET) private legacyJwtSecret: string,
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.SessionRepository) private sessionRepository: SessionRepositoryInterface,
  ) {
  }

  async execute(dto: AuthenticateUserDTO): Promise<AuthenticateUserResponse> {
    const authenticationMethod = await this.establishAuthenticationMethod(dto.token)
    if (!authenticationMethod) {
      return {
        success: false,
        failureType: 'INVALID_AUTH'
      }
    }

    const user = authenticationMethod.user
    if (!user) {
      return {
        success: false,
        failureType: 'INVALID_AUTH'
      }
    }

    if(authenticationMethod.type == 'jwt' && user.supportsSessions()) {
      return {
        success: false,
        failureType: 'INVALID_AUTH'
      }
    }

    switch(authenticationMethod.type) {
      case 'jwt': {
        const pwHash = <string> (<Record<string, unknown>> authenticationMethod.claims).pw_hash
        const encryptedPasswordDigest = crypto.createHash('sha256').update(user.encryptedPassword).digest('hex')

        if (!pwHash || !crypto.timingSafeEqual(Buffer.from(pwHash), Buffer.from(encryptedPasswordDigest))) {
          return {
            success: false,
            failureType: 'INVALID_AUTH'
          }
        }
        break
      }
      case 'session_token': {
        const session = <Session> authenticationMethod.session

        if (session.refreshExpired()) {
          return {
            success: false,
            failureType: 'INVALID_AUTH'
          }
        }

        if (session.accessExpired()) {
          return {
            success: false,
            failureType: 'EXPIRED_TOKEN'
          }
        }

        break
      }
    }

    return {
      success: true,
      user,
      session: authenticationMethod.session
    }
  }

  private decodeToken(token: string): Record<string, unknown> | undefined {
    try {
      return <Record<string, unknown>> verify(token, this.jwtSecret, {
        algorithms: [ 'HS256' ]
      })
    } catch (error) {
      try {
        return <Record<string, unknown>> verify(token, this.legacyJwtSecret, {
          algorithms: [ 'HS256' ]
        })
      } catch (legacyError) {
        return undefined
      }
    }
  }

  private async establishAuthenticationMethod(token: string): Promise<AuthenticationMethod | undefined> {
    const decodedToken = this.decodeToken(token)
    if (decodedToken) {
      return {
        type: 'jwt',
        user: await this.userRepository.findOneById(<string> decodedToken.user_uuid),
        claims: decodedToken,
      }
    }

    const session = await this.sessionRepository.findOneByToken(token)
    if (session) {
      return {
        type: 'session_token',
        user: await this.userRepository.findOneById(session.userUuid),
        session: session,
      }
    }

    return undefined
  }
}
