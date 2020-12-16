import 'reflect-metadata'

import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { UnlockUser } from './UnlockUser'

describe('UnlockUser', () => {
  let userRepository: UserRepositoryInterface
  let user: User

  const createUseCase = () => new UnlockUser(userRepository)

  beforeEach(() => {
    user = {} as jest.Mocked<User>
    user.uuid = '234'

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.resetLockCounters = jest.fn()
    userRepository.findOneByEmail = jest.fn().mockReturnValue(user)
  })

  it('should unlock an user by email', async () => {
    expect(await createUseCase().execute({ email: 'test@test.te' })).toEqual({ success: true })

    expect(userRepository.resetLockCounters).toHaveBeenCalledWith('234')
  })

  it('should unlock an user by email if user does not exist', async () => {
    userRepository.findOneByEmail = jest.fn().mockReturnValue(null)

    expect(await createUseCase().execute({ email: 'test@test.te' })).toEqual({ success: false })

    expect(userRepository.resetLockCounters).not.toHaveBeenCalled()
  })
})
