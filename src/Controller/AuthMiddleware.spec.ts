import 'reflect-metadata'

import * as winston from 'winston'

import { AuthMiddleware } from './AuthMiddleware'
import { NextFunction, Request, Response } from 'express'
import { sign } from 'jsonwebtoken'
import { RoleName } from '@standardnotes/common'

describe('AuthMiddleware', () => {
  let logger: winston.Logger
  const jwtSecret = 'auth_jwt_secret'
  let request: Request
  let response: Response
  let next: NextFunction

  const createMiddleware = () => new AuthMiddleware(jwtSecret, logger)

  beforeEach(() => {
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

  it('should authorize user from an auth JWT token if present', async () => {
    const authToken = sign({
      user: { uuid: '123' },
      session: { uuid: '234' },
      roles: [
        {
          uuid: '1-2-3',
          name: RoleName.BasicUser,
        },
        {
          uuid: '2-3-4',
          name: RoleName.ProUser,
        },
      ],
      permissions: [],
    }, jwtSecret, { algorithm: 'HS256' })

    request.header = jest.fn().mockReturnValue(authToken)

    await createMiddleware().handler(request, response, next)

    expect(response.locals.user).toEqual({ uuid: '123' })
    expect(response.locals.roleNames).toEqual([ 'BASIC_USER', 'PRO_USER' ])
    expect(response.locals.session).toEqual({ uuid: '234' })

    expect(next).toHaveBeenCalled()
  })

  it('should not authorize user from an auth JWT token if it is invalid', async () => {
    const authToken = sign({
      user: { uuid: '123' },
      session: { uuid: '234' },
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
})
