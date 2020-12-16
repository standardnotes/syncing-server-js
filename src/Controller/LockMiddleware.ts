import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { BaseMiddleware } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'

import { UserRepositoryInterface } from '../Domain/User/UserRepositoryInterface'

@injectable()
export class LockMiddleware extends BaseMiddleware {
    constructor (
        @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface
    ) {
      super()
    }

    async handler (request: Request, response: Response, next: NextFunction): Promise<void> {
      const user = await this.userRepository.findOneByEmail(request.body.email)

      if (user?.isLocked()) {
        response.status(423).send({
          error: {
            message: 'Too many successive login requests. Please try your request again later.'
          },
        })

        return
      }

      return next()
    }
}
