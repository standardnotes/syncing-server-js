import 'reflect-metadata'

import { LockMiddleware } from './LockMiddleware'
import { NextFunction, Request, Response } from 'express'
import { User } from '../Domain/User/User'
import { UserRepositoryInterface } from '../Domain/User/UserRepositoryInterface'

describe('LockMiddleware', () => {
  let userRepository: UserRepositoryInterface
  let request: Request
  let response: Response
  let user: User
  let next: NextFunction

  const createMiddleware = () => new LockMiddleware(userRepository)

  beforeEach(() => {
    user = {} as jest.Mocked<User>
    user.isLocked = jest.fn().mockReturnValue(true)

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByEmail = jest.fn().mockReturnValue(user)

    request = {
      body: {}
    } as jest.Mocked<Request>
    response = {} as jest.Mocked<Response>
    response.status = jest.fn().mockReturnThis()
    response.send = jest.fn()
    next = jest.fn()
  })

  it('should return locked response if user is locked', async () => {
    await createMiddleware().handler(request, response, next)

    expect(response.status).toHaveBeenCalledWith(423)

    expect(next).not.toHaveBeenCalled()
  })

  it('should let the request pass if user is not locked', async () => {
    user.isLocked = jest.fn().mockReturnValue(false)

    await createMiddleware().handler(request, response, next)

    expect(response.status).not.toHaveBeenCalled()

    expect(next).toHaveBeenCalled()
  })

  it('should let the request pass if there is no user found', async () => {
    userRepository.findOneByEmail = jest.fn().mockReturnValue(null)

    await createMiddleware().handler(request, response, next)

    expect(response.status).not.toHaveBeenCalled()

    expect(next).toHaveBeenCalled()
  })
})
