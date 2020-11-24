import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { BaseMiddleware } from 'inversify-express-utils'
import * as winston from 'winston'
import TYPES from '../Bootstrap/Types'

import { AuthenticateUser } from '../Domain/UseCase/AuthenticateUser'
import { AuthenticateUserResponse } from '../Domain/UseCase/AuthenticateUserResponse'

@injectable()
export class AuthMiddleware extends BaseMiddleware {
    private logger: winston.Logger

    constructor (
        @inject(TYPES.AuthenticateUser) private authenticateUser: AuthenticateUser,
        @inject(TYPES.LoggerFactory) loggerFactory: () => winston.Logger,
    ) {
      super()
      this.logger = loggerFactory()
    }

    async handler (request: Request, response: Response, next: NextFunction): Promise<void> {
        const authorizationHeader = <string> request.headers.authorization

        if (!authorizationHeader) {
            this.logger.warn('Missing authentication headers')

            return this.sendInvalidAuthResponse(response)
        }

        let authenticateResponse: AuthenticateUserResponse
        try {
            authenticateResponse = await this.authenticateUser.execute({ token: authorizationHeader.replace('Bearer ', '') })
        } catch (error) {
            this.logger.error('Error occurred during authentication of a user %o', error)

            return this.sendInvalidAuthResponse(response)
        }

        if (!authenticateResponse.success) {
          switch (authenticateResponse.failureType) {
            case 'EXPIRED_TOKEN':
              return this.sendExpiredTokenResponse(response)
            case 'INVALID_AUTH':
              return this.sendInvalidAuthResponse(response)
          }
        }

        this.logger.info('Successfully authenticated user')

        response.locals.user = authenticateResponse.user
        response.locals.session = authenticateResponse.session

        return next()
    }

    private sendInvalidAuthResponse(response: Response) {
      this.logger.warn('Invalid login credentials supplied')

      response.status(401).send({
        error: {
          tag: 'invalid-auth',
          message: 'Invalid login credentials.',
        },
      })
    }

    private sendExpiredTokenResponse(response: Response) {
      this.logger.warn('Expired token supplied')

      response.status(498).send({
        error: {
          tag: 'expired-access-token',
          message: 'The provided access token has expired.',
        },
      })
    }
}
