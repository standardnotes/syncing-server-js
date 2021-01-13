import * as crypto from 'crypto'

import { inject, injectable } from 'inversify'
import { sign } from 'jsonwebtoken'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { ProjectorInterface } from '../../Projection/ProjectorInterface'

import { User } from '../User/User'
import { AuthResponse20161215 } from './AuthResponse20161215'
import { AuthResponse20200115 } from './AuthResponse20200115'
import { AuthResponseFactoryInterface } from './AuthResponseFactoryInterface'

@injectable()
export class AuthResponseFactory20161215 implements AuthResponseFactoryInterface {
  constructor(
    @inject(TYPES.UserProjector) protected userProjector: ProjectorInterface<User>,
    @inject(TYPES.JWT_SECRET) protected jwtSecret: string,
    @inject(TYPES.Logger) protected logger: Logger
  ) {
  }

  async createResponse(user: User, ..._args: any[]): Promise<AuthResponse20161215 | AuthResponse20200115> {
    this.logger.debug(`Creating JWT auth response for user ${user.uuid}`)

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

    this.logger.debug(`Created JWT token for user ${user.uuid}: ${token}`)

    return {
      user: this.userProjector.projectSimple(user),
      token
    }
  }
}
