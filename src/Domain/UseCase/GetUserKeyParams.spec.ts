import 'reflect-metadata'

import { KeyParamsFactoryInterface } from '../User/KeyParamsFactoryInterface'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { GetUserKeyParams } from './GetUserKeyParams'

describe('GetUserKeyParams', () => {
  let keyParamsFactory: KeyParamsFactoryInterface
  let userRepository: UserRepositoryInterface
  let user: User

  const createUseCase = () => new GetUserKeyParams(keyParamsFactory, userRepository)

  beforeEach(() => {
    keyParamsFactory = {} as jest.Mocked<KeyParamsFactoryInterface>
    keyParamsFactory.create = jest.fn().mockReturnValue({ foo: 'bar' })
    keyParamsFactory.createPseudoParams = jest.fn().mockReturnValue({ bar: 'baz' })

    user = {} as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByEmail = jest.fn().mockReturnValue(user)
  })

  it('should get key params for an authenticated user', async () => {
    expect(await createUseCase().execute({ email: 'test@test.te', authenticatedUser: user })).toEqual({
      keyParams: {
        foo: 'bar'
      }
    })

    expect(keyParamsFactory.create).toHaveBeenCalledWith(user, true)
  })

  it('should get key params for an unauthenticated user', async () => {
    expect(await createUseCase().execute({ email: 'test@test.te' })).toEqual({
      keyParams: {
        foo: 'bar'
      }
    })

    expect(keyParamsFactory.create).toHaveBeenCalledWith(user, false)
  })

  it('should get pseudo key params for a non existing user', async () => {
    userRepository.findOneByEmail = jest.fn().mockReturnValue(null)

    expect(await createUseCase().execute({ email: 'test@test.te' })).toEqual({
      keyParams: {
        bar: 'baz'
      }
    })

    expect(keyParamsFactory.createPseudoParams).toHaveBeenCalledWith('test@test.te')
  })
})
