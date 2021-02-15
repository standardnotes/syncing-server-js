import 'reflect-metadata'

import * as winston from 'winston'

import { AuthMiddlewareWithoutResponse } from './AuthMiddlewareWithoutResponse'
import { AuthenticateUser } from '../Domain/UseCase/AuthenticateUser'
import { NextFunction, Request, Response } from 'express'
import { User } from '../Domain/User/User'
import { Session } from '../Domain/Session/Session'
import { sign } from 'jsonwebtoken'

describe('AuthMiddlewareWithoutResponse', () => {
  let logger: winston.Logger
  let authenticateUser: AuthenticateUser
  const jwtSecret = 'auth_jwt_secret'
  let request: Request
  let response: Response
  let next: NextFunction

  const createMiddleware = () => new AuthMiddlewareWithoutResponse(authenticateUser, jwtSecret, logger)

  beforeEach(() => {
    authenticateUser = {} as jest.Mocked<AuthenticateUser>
    authenticateUser.execute = jest.fn()

    logger = {} as jest.Mocked<winston.Logger>
    logger.info = jest.fn()
    logger.warn = jest.fn()
    logger.error = jest.fn()

    request = {
      headers: {}
    } as jest.Mocked<Request>
    response = {
      locals: {}
    } as jest.Mocked<Response>
    response.status = jest.fn().mockReturnThis()
    response.send = jest.fn()
    next = jest.fn()
  })

  it('should authorize user based on a jwt token', async () => {
    request.headers.authorization = 'Bearer test'

    const user = {} as jest.Mocked<User>
    authenticateUser.execute = jest.fn().mockReturnValue({
      success: true,
      user: user
    })

    await createMiddleware().handler(request, response, next)

    expect(response.locals.user).toEqual(user)

    expect(next).toHaveBeenCalled()
  })

  it('should authorize user from an auth JWT token if present', async () => {
    const user = {} as jest.Mocked<User>
    const session = {} as jest.Mocked<Session>

    const authToken = sign({
      user,
      session,
      roles: [],
      permissions: []
    }, jwtSecret, { algorithm: 'HS256' })

    request.headers['X-Auth-Token'] = authToken

    await createMiddleware().handler(request, response, next)

    expect(response.locals.user).toEqual(user)
    expect(response.locals.session).toEqual(session)

    expect(next).toHaveBeenCalled()
    expect(authenticateUser.execute).not.toHaveBeenCalled()
  })

  it('should skip middleware if authorization header is missing', async () => {
    await createMiddleware().handler(request, response, next)

    expect(next).toHaveBeenCalled()
  })

  it('should skip middleware if an error occurres', async () => {
    request.headers.authorization = 'Bearer test'
    authenticateUser.execute = jest.fn().mockImplementation(() => {
      throw new Error('something bad happened')
    })

    await createMiddleware().handler(request, response, next)

    expect(next).toHaveBeenCalled()
  })

  it('should skip middleware if authentication fails', async () => {
    request.headers.authorization = 'Bearer test'

    authenticateUser.execute = jest.fn().mockReturnValue({
      success: false,
      failureType: 'INVALID_AUTH',
    })

    await createMiddleware().handler(request, response, next)

    expect(next).toHaveBeenCalled()
  })

  it('should skip middleware if the token is expired', async () => {
    request.headers.authorization = 'Bearer test'

    authenticateUser.execute = jest.fn().mockReturnValue({
      success: false,
      failureType: 'EXPIRED_TOKEN',
    })

    await createMiddleware().handler(request, response, next)

    expect(next).toHaveBeenCalled()
  })
})
