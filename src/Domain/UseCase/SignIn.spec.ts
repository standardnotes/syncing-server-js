import 'reflect-metadata'

import { AuthResponseFactoryInterface } from '../Auth/AuthResponseFactoryInterface'
import { CurrentAuthResponse } from '../Auth/CurrentAuthResponse'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { SignIn } from './SignIn'

describe('SignIn', () => {
  let user: User
  let authResponse: CurrentAuthResponse
  let userRepository: UserRepositoryInterface
  let authResponseFactory: AuthResponseFactoryInterface

  const createUseCase = () => new SignIn(userRepository, authResponseFactory)

  beforeEach(() => {
    user = {} as jest.Mocked<User>
    user.encryptedPassword = '$2a$11$K3g6XoTau8VmLJcai1bB0eD9/YvBSBRtBhMprJOaVZ0U3SgasZH3a'

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByEmail = jest.fn().mockReturnValue(user)

    authResponse = {} as jest.Mocked<CurrentAuthResponse>

    authResponseFactory = {} as jest.Mocked<AuthResponseFactoryInterface>
    authResponseFactory.createSuccessAuthResponse = jest.fn().mockReturnValue(authResponse)
  })

  it('should sign in a user', async () => {
    expect(await createUseCase().execute({
      email: 'test@test.te',
      password: 'qweqwe123123',
      userAgent: 'Google Chrome',
      apiVersion: '004'
    })).toEqual({
      success: true,
      authResponse
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
