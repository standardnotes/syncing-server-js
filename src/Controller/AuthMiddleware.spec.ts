import 'reflect-metadata'

import * as winston from 'winston'

import { AuthMiddleware } from './AuthMiddleware'
import { AuthenticateUser } from '../Domain/UseCase/AuthenticateUser'
import { NextFunction, Request, Response } from 'express'
import { User } from '../Domain/User/User'
import { sign } from 'jsonwebtoken'
import { Session } from '../Domain/Session/Session'

describe('AuthMiddleware', () => {
  let logger: winston.Logger
  let authenticateUser: AuthenticateUser
  const jwtSecret = 'auth_jwt_secret'
  let request: Request
  let response: Response
  let next: NextFunction

  const createMiddleware = () => new AuthMiddleware(authenticateUser, jwtSecret, logger)

  beforeEach(() => {
    authenticateUser = {} as jest.Mocked<AuthenticateUser>
    authenticateUser.execute = jest.fn()

    logger = {} as jest.Mocked<winston.Logger>
    logger.info = jest.fn()
    logger.debug = jest.fn()
    logger.warn = jest.fn()
    logger.error = jest.fn()

    request = {
      headers: {},
    } as jest.Mocked<Request>
    request.header = jest.fn()
    response = {
      locals: {},
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
      user: user,
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
      permissions: [],
    }, jwtSecret, { algorithm: 'HS256' })

    request.header = jest.fn().mockReturnValue(authToken)

    await createMiddleware().handler(request, response, next)

    expect(response.locals.user).toEqual(user)
    expect(response.locals.session).toEqual(session)

    expect(next).toHaveBeenCalled()
    expect(authenticateUser.execute).not.toHaveBeenCalled()
  })

  it('should not authorize user from an auth JWT token if it is invalid', async () => {
    const user = {} as jest.Mocked<User>
    const session = {} as jest.Mocked<Session>

    const authToken = sign({
      user,
      session,
      roles: [],
      permissions: [],
    }, jwtSecret, { algorithm: 'HS256', notBefore: '2 days' })

    request.header = jest.fn().mockReturnValue(authToken)

    await createMiddleware().handler(request, response, next)

    expect(response.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('should not authorize if authorization header is missing', async () => {
    await createMiddleware().handler(request, response, next)

    expect(response.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('should not authorize if an error occurres', async () => {
    request.headers.authorization = 'Bearer test'
    authenticateUser.execute = jest.fn().mockImplementation(() => {
      throw new Error('something bad happened')
    })

    await createMiddleware().handler(request, response, next)

    expect(response.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('should not authorize user if authentication fails', async () => {
    request.headers.authorization = 'Bearer test'

    authenticateUser.execute = jest.fn().mockReturnValue({
      success: false,
      failureType: 'INVALID_AUTH',
    })

    await createMiddleware().handler(request, response, next)

    expect(response.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('should not authorize user if the token is expired', async () => {
    request.headers.authorization = 'Bearer test'

    authenticateUser.execute = jest.fn().mockReturnValue({
      success: false,
      failureType: 'EXPIRED_TOKEN',
    })

    await createMiddleware().handler(request, response, next)

    expect(response.status).toHaveBeenCalledWith(498)
    expect(next).not.toHaveBeenCalled()
  })

  it('should not authorize user if the session is revoked', async () => {
    request.headers.authorization = 'Bearer test'

    authenticateUser.execute = jest.fn().mockReturnValue({
      success: false,
      failureType: 'REVOKED_SESSION',
    })

    await createMiddleware().handler(request, response, next)

    expect(response.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })
})
