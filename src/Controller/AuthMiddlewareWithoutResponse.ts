import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { BaseMiddleware } from 'inversify-express-utils'
import { verify } from 'jsonwebtoken'
import { Token } from '@standardnotes/auth'
import * as winston from 'winston'
import TYPES from '../Bootstrap/Types'

import { AuthenticateUser } from '../Domain/UseCase/AuthenticateUser'
import { AuthenticateUserResponse } from '../Domain/UseCase/AuthenticateUserResponse'

@injectable()
export class AuthMiddlewareWithoutResponse extends BaseMiddleware {
  constructor (
    @inject(TYPES.AuthenticateUser) private authenticateUser: AuthenticateUser,
    @inject(TYPES.AUTH_JWT_SECRET) private jwtSecret: string,
    @inject(TYPES.Logger) private logger: winston.Logger,
  ) {
    super()
  }

  async handler (request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      this.handleAuthServiceProxy(request, response)
    } catch (error) {
      this.logger.error(`Could not verify JWT Auth Token ${error.message}`)

      return next()
    }

    if (response.locals.user && response.locals.session) {
      return next()
    }

    this.logger.debug('Attempting authorization from Authorization Header.')

    const authorizationHeader = <string> request.headers.authorization

    if (!authorizationHeader) {
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

  private handleAuthServiceProxy(request: Request, response: Response) {
    if (request.header('X-Auth-Token')) {
      this.logger.debug('X-Auth-Token present in the request. Attempting authorization from JWT.')

      const authToken = <string> request.header('X-Auth-Token')

      const decodedToken = <Token> verify(authToken, this.jwtSecret, { algorithms: [ 'HS256' ] })

      response.locals.user = decodedToken.user
      response.locals.session = decodedToken.session
    }
  }
}
