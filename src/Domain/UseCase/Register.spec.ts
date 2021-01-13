import 'reflect-metadata'
import { AuthResponseFactoryInterface } from '../Auth/AuthResponseFactoryInterface'
import { AuthResponseFactoryResolverInterface } from '../Auth/AuthResponseFactoryResolverInterface'
import { User } from '../User/User'

import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { Register } from './Register'

describe('Register', () => {
  let userRepository: UserRepositoryInterface
  let authResponseFactoryResolver: AuthResponseFactoryResolverInterface
  let authResponseFactory: AuthResponseFactoryInterface
  let user: User

  const createUseCase = () => new Register(userRepository, authResponseFactoryResolver, false)

  beforeEach(() => {
    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.save = jest.fn()
    userRepository.findOneByEmail = jest.fn()

    authResponseFactory = {} as jest.Mocked<AuthResponseFactoryInterface>
    authResponseFactory.createResponse = jest.fn().mockReturnValue({ foo: 'bar' })

    authResponseFactoryResolver = {} as jest.Mocked<AuthResponseFactoryResolverInterface>
    authResponseFactoryResolver.resolveAuthResponseFactoryVersion = jest.fn().mockReturnValue(authResponseFactory)

    user = {} as jest.Mocked<User>
  })

  it('should register a new user', async () => {
    expect(await createUseCase().execute({
      email: 'test@test.te',
      password: 'asdzxc',
      updatedWithUserAgent: 'Mozilla',
      apiVersion: '20190520',
      ephemeralSession: false,
      version: '004',
      pwCost: 11,
      pwSalt: 'qweqwe',
      pwNonce: undefined
    })).toEqual({ success: true, authResponse: { foo: 'bar' } })

    expect(userRepository.save).toHaveBeenCalledWith({
      email: 'test@test.te',
      encryptedPassword: expect.any(String),
      pwCost: 11,
      pwNonce: undefined,
      pwSalt: 'qweqwe',
      updatedWithUserAgent: 'Mozilla',
      uuid: expect.any(String),
      version: '004',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      SESSIONS_PROTOCOL_VERSION: 4
    })
  })

  it('should fail to register if a user already exists', async () => {
    userRepository.findOneByEmail = jest.fn().mockReturnValue(user)

    expect(await createUseCase().execute({
      email: 'test@test.te',
      password: 'asdzxc',
      updatedWithUserAgent: 'Mozilla',
      apiVersion: '20190520',
      ephemeralSession: false,
      version: '004',
      pwCost: 11,
      pwSalt: 'qweqwe',
      pwNonce: undefined
    })).toEqual({
      success: false,
      errorMessage: 'This email is already registered.'
    })

    expect(userRepository.save).not.toHaveBeenCalled()
  })

  it('should fail to register if a registration is disabled', async () => {
    userRepository.findOneByEmail = jest.fn().mockReturnValue(user)

    expect(await new Register(userRepository, authResponseFactoryResolver, true).execute({
      email: 'test@test.te',
      password: 'asdzxc',
      updatedWithUserAgent: 'Mozilla',
      apiVersion: '20190520',
      version: '004',
      ephemeralSession: false,
      pwCost: 11,
      pwSalt: 'qweqwe',
      pwNonce: undefined
    })).toEqual({
      success: false,
      errorMessage: 'User registration is currently not allowed.'
    })

    expect(userRepository.save).not.toHaveBeenCalled()
  })
})
