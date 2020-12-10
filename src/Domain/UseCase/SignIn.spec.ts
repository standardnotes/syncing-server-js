import 'reflect-metadata'

import * as bcryptjs from 'bcryptjs'
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
    user.encryptedPassword = '$2a$11$K3g6XoTau8VmLJcai1bB0eYCa6LNouMpPj6Uu4yzTkq2b9vbR8yRK'

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByEmail = jest.fn().mockReturnValue(user)

    authResponse = {} as jest.Mocked<CurrentAuthResponse>

    authResponseFactory = {} as jest.Mocked<AuthResponseFactoryInterface>
    authResponseFactory.createSuccessAuthResponse = jest.fn().mockReturnValue(authResponse)
  })

  it('should sign in a user', async () => {
    const salt = await bcryptjs.getSalt('$2a$11$K3g6XoTau8VmLJcai1bB0eYCa6LNouMpPj6Uu4yzTkq2b9vbR8yRK')
    const hashed = await bcryptjs.hashSync('qweqwe123123', salt)


    console.log(hashed)

    const a = bcryptjs.encodeBase64(Buffer.from(hashed), 60)
    console.log(a)

    console.log(await bcryptjs.compareSync(hashed, '$2a$11$K3g6XoTau8VmLJcai1bB0eYCa6LNouMpPj6Uu4yzTkq2b9vbR8yRK'))

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
})
