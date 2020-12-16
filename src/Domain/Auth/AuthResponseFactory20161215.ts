import * as crypto from 'crypto'

import { inject, injectable } from 'inversify'
import { sign } from 'jsonwebtoken'
import TYPES from '../../Bootstrap/Types'
import { ProjectorInterface } from '../../Projection/ProjectorInterface'

import { User } from '../User/User'
import { AuthResponseFactoryInterface } from './AuthResponseFactoryInterface'

@injectable()
export class AuthResponseFactory20161215 implements AuthResponseFactoryInterface {
  constructor(
    @inject(TYPES.UserProjector) protected userProjector: ProjectorInterface<User>,
    @inject(TYPES.JWT_SECRET) protected jwtSecret: string
  ) {
  }

  async createResponse(user: User, ..._args: any[]): Promise<Record<string, unknown>> {
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
}
