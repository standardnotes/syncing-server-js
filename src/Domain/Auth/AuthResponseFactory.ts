import * as crypto from 'crypto'

import { inject, injectable } from 'inversify'
import { sign } from 'jsonwebtoken'
import TYPES from '../../Bootstrap/Types'
import { ProjectorInterface } from '../../Projection/ProjectorInterface'
import { SessionServiceInterace } from '../Session/SessionServiceInterface'
import { KeyParamsFactoryInterface } from '../User/KeyParamsFactoryInterface'

import { User } from '../User/User'
import { CurrentAuthResponse } from './CurrentAuthResponse'
import { LegacyAuthResponse } from './LegacyAuthResponse'

@injectable()
export class AuthResponseFactory {
  constructor(
    @inject(TYPES.SessionService) private sessionService: SessionServiceInterace,
    @inject(TYPES.KeyParamsFactory) private keyParamsFactory: KeyParamsFactoryInterface,
    @inject(TYPES.UserProjector) private userProjector: ProjectorInterface<User>,
    @inject(TYPES.JWT_SECRET) private jwtSecret: string
  ) {
  }

  async createSuccessAuthResponse(user: User, apiVersion: string, userAgent: string): Promise<CurrentAuthResponse | LegacyAuthResponse> {
    switch (apiVersion) {
      case '20200115':
        return this.createCurrentSuccessAuthResponse(user, apiVersion, userAgent)
      default:
        return this.createLegacySuccessAuthResponse(user)
    }
  }

  private async createLegacySuccessAuthResponse(user: User): Promise<LegacyAuthResponse> {
    const token = sign(
      {
        user_uuid: user.uuid,
        pw_hash: crypto.createHash('sha256').update(user.encryptedPassword).digest('hex')
      },
      this.jwtSecret,
      {
        algorithm: 'HS256'
      }
    )

    return {
      user: this.userProjector.projectSimple(user),
      token
    }
  }

  private async createCurrentSuccessAuthResponse(user: User, apiVersion: string, userAgent: string): Promise<CurrentAuthResponse | LegacyAuthResponse> {
    if (!user.supportsSessions()) {
      return this.createLegacySuccessAuthResponse(user)
    }

    const session = await this.sessionService.createNewSessionForUser(user, apiVersion, userAgent)

    const sessionPayload = await this.sessionService.createTokens(session)

    return {
      session: sessionPayload,
      key_params: this.keyParamsFactory.create(user),
      user: this.userProjector.projectSimple(user)
    }
  }
}
