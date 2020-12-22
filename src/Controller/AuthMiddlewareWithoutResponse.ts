import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { BaseMiddleware } from 'inversify-express-utils'
import * as winston from 'winston'
import TYPES from '../Bootstrap/Types'

import { AuthenticateUser } from '../Domain/UseCase/AuthenticateUser'
import { AuthenticateUserResponse } from '../Domain/UseCase/AuthenticateUserResponse'

@injectable()
export class AuthMiddlewareWithoutResponse extends BaseMiddleware {
    constructor (
        @inject(TYPES.AuthenticateUser) private authenticateUser: AuthenticateUser,
        @inject(TYPES.Logger) private logger: winston.Logger,
    ) {
      super()
    }

    async handler (request: Request, response: Response, next: NextFunction): Promise<void> {
        const authorizationHeader = <string> request.headers.authorization

        if (!authorizationHeader) {
            this.logger.warn('Missing authentication headers')

            return next()
        }

        let authenticateResponse: AuthenticateUserResponse
        try {
            authenticateResponse = await this.authenticateUser.execute({ token: authorizationHeader.replace('Bearer ', '') })
        } catch (error) {
            this.logger.error('Error occurred during authentication of a user %o', error)

            return next()
        }

        if (!authenticateResponse.success) {
          return next()
        }

        response.locals.user = authenticateResponse.user
        response.locals.session = authenticateResponse.session

        return next()
    }
}
