import 'reflect-metadata'
import { AuthResponseFactoryInterface } from '../Auth/AuthResponseFactoryInterface'

import { AuthResponseFactoryResolverInterface } from '../Auth/AuthResponseFactoryResolverInterface'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'

import { ChangePassword } from './ChangePassword'

describe('ChangePassword', () => {
  let userRepository: UserRepositoryInterface
  let authResponseFactoryResolver: AuthResponseFactoryResolverInterface
  let authResponseFactory: AuthResponseFactoryInterface
  let user: User

  const createUseCase = () => new ChangePassword(userRepository, authResponseFactoryResolver)

  beforeEach(() => {
    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.save = jest.fn()

    authResponseFactory = {} as jest.Mocked<AuthResponseFactoryInterface>
    authResponseFactory.createResponse = jest.fn().mockReturnValue({ foo: 'bar' })

    authResponseFactoryResolver = {} as jest.Mocked<AuthResponseFactoryResolverInterface>
    authResponseFactoryResolver.resolveAuthResponseFactoryVersion = jest.fn().mockReturnValue(authResponseFactory)

    user = {} as jest.Mocked<User>
    user.encryptedPassword = '$2a$11$K3g6XoTau8VmLJcai1bB0eD9/YvBSBRtBhMprJOaVZ0U3SgasZH3a'
  })

  it('should change password', async () => {
    expect(await createUseCase().execute({
      user,
      apiVersion: '20190520',
      currentPassword: 'qweqwe123123',
      newPassword: 'test234',
      pwNonce: 'asdzxc',
      updatedWithUserAgent: 'Google Chrome',
    })).toEqual({
      success: true,
      authResponse: {
        foo: 'bar'
      }
    })

    expect(userRepository.save).toHaveBeenCalledWith({
      encryptedPassword: expect.any(String),
      updatedWithUserAgent: 'Google Chrome',
      pwNonce: 'asdzxc',
    })
  })

  it('should not change password if current password is incorrect', async () => {
    expect(await createUseCase().execute({
      user,
      apiVersion: '20190520',
      currentPassword: 'test123',
      newPassword: 'test234',
      pwNonce: 'asdzxc',
      updatedWithUserAgent: 'Google Chrome',
    })).toEqual({
      success: false,
      errorMessage: 'The current password you entered is incorrect. Please try again.'
    })

    expect(userRepository.save).not.toHaveBeenCalled()
  })

  it('should update protocol version while changing password', async () => {
    expect(await createUseCase().execute({
      user,
      apiVersion: '20190520',
      currentPassword: 'qweqwe123123',
      newPassword: 'test234',
      pwNonce: 'asdzxc',
      updatedWithUserAgent: 'Google Chrome',
      protocolVersion: '004'
    })).toEqual({
      success: true,
      authResponse: {
        foo: 'bar'
      }
    })

    expect(userRepository.save).toHaveBeenCalledWith({
      encryptedPassword: expect.any(String),
      updatedWithUserAgent: 'Google Chrome',
      pwNonce: 'asdzxc',
      version: '004'
    })
  })
})
