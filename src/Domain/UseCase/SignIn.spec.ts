import 'reflect-metadata'
import { Logger } from 'winston'

import { AuthResponseFactoryInterface } from '../Auth/AuthResponseFactoryInterface'
import { AuthResponseFactoryResolverInterface } from '../Auth/AuthResponseFactoryResolverInterface'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { SignIn } from './SignIn'

describe('SignIn', () => {
  let user: User
  let userRepository: UserRepositoryInterface
  let authResponseFactoryResolver: AuthResponseFactoryResolverInterface
  let authResponseFactory: AuthResponseFactoryInterface
  let logger: Logger

  const createUseCase = () => new SignIn(userRepository, authResponseFactoryResolver, logger)

  beforeEach(() => {
    user = {} as jest.Mocked<User>
    user.encryptedPassword = '$2a$11$K3g6XoTau8VmLJcai1bB0eD9/YvBSBRtBhMprJOaVZ0U3SgasZH3a'

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByEmail = jest.fn().mockReturnValue(user)

    authResponseFactory = {} as jest.Mocked<AuthResponseFactoryInterface>
    authResponseFactory.createResponse = jest.fn().mockReturnValue({ foo: 'bar' })

    authResponseFactoryResolver = {} as jest.Mocked<AuthResponseFactoryResolverInterface>
    authResponseFactoryResolver.resolveAuthResponseFactoryVersion = jest.fn().mockReturnValue(authResponseFactory)

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
  })

  it('should sign in a user', async () => {
    expect(await createUseCase().execute({
      email: 'test@test.te',
      password: 'qweqwe123123',
      userAgent: 'Google Chrome',
      apiVersion: '20190520',
      ephemeralSession: false,
    })).toEqual({
      success: true,
      authResponse: { foo: 'bar' },
    })
  })

  it('should not sign in a user with wrong credentials', async () => {
    expect(await createUseCase().execute({
      email: 'test@test.te',
      password: 'asdasd123123',
      userAgent: 'Google Chrome',
      apiVersion: '20190520',
      ephemeralSession: false,
    })).toEqual({
      success: false,
      errorMessage: 'Invalid email or password',
    })
  })

  it('should not sign in a user that does not exist', async () => {
    userRepository.findOneByEmail = jest.fn().mockReturnValue(undefined)

    expect(await createUseCase().execute({
      email: 'test@test.te',
      password: 'asdasd123123',
      userAgent: 'Google Chrome',
      apiVersion: '20190520',
      ephemeralSession: false,
    })).toEqual({
      success: false,
      errorMessage: 'Invalid email or password',
    })
  })
})
