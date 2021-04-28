import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { BaseMiddleware } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { LockRepositoryInterface } from '../Domain/User/LockRepositoryInterface'

import { UserRepositoryInterface } from '../Domain/User/UserRepositoryInterface'

@injectable()
export class LockMiddleware extends BaseMiddleware {
  constructor (
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.LockRepository) private lockRepository: LockRepositoryInterface
  ) {
    super()
  }

  async handler (request: Request, response: Response, next: NextFunction): Promise<void> {
    const user = await this.userRepository.findOneByEmail(request.body.email)
    if (!user) {
      return next()
    }

    if (await this.lockRepository.isUserLocked(user.uuid)) {
      response.status(423).send({
        error: {
          message: 'Too many successive login requests. Please try your request again later.',
        },
      })

      return
    }

    return next()
  }
}
