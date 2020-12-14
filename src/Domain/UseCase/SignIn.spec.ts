import 'reflect-metadata'

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

  const createUseCase = () => new SignIn(userRepository, authResponseFactoryResolver)

  beforeEach(() => {
    user = {} as jest.Mocked<User>
    user.encryptedPassword = '$2a$11$K3g6XoTau8VmLJcai1bB0eD9/YvBSBRtBhMprJOaVZ0U3SgasZH3a'

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByEmail = jest.fn().mockReturnValue(user)

    authResponseFactory = {} as jest.Mocked<AuthResponseFactoryInterface>
    authResponseFactory.createResponse = jest.fn().mockReturnValue({ foo: 'bar' })

    authResponseFactoryResolver = {} as jest.Mocked<AuthResponseFactoryResolverInterface>
    authResponseFactoryResolver.resolveAuthResponseFactoryVersion = jest.fn().mockReturnValue(authResponseFactory)
  })

  it('should sign in a user', async () => {
    expect(await createUseCase().execute({
      email: 'test@test.te',
      password: 'qweqwe123123',
      userAgent: 'Google Chrome',
      apiVersion: '20190520'
    })).toEqual({
      success: true,
      authResponse: { foo: 'bar' }
    })
  })

  it('should not sign in a user with wrong credentials', async () => {
    expect(await createUseCase().execute({
      email: 'test@test.te',
      password: 'asdasd123123',
      userAgent: 'Google Chrome',
      apiVersion: '20190520'
    })).toEqual({
      success: false,
      errorMessage: 'Invalid email or password'
    })
  })

  it('should not sign in a user with wrong credentials', async () => {
    expect(await createUseCase().execute({
      email: 'test@test.te',
      password: 'asdasd123123',
      userAgent: 'Google Chrome',
      apiVersion: '004'
    })).toEqual({
      success: false,
      errorMessage: 'Invalid email or password'
    })
  })
})
