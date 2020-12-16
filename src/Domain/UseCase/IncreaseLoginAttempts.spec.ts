import 'reflect-metadata'

import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { IncreaseLoginAttempts } from './IncreaseLoginAttempts'

describe('IncreaseLoginAttempts', () => {
  let userRepository: UserRepositoryInterface
  let user: User

  const createUseCase = () => new IncreaseLoginAttempts(userRepository, 6, 3600)

  beforeEach(() => {
    user = {} as jest.Mocked<User>
    user.uuid = '123'

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByEmail = jest.fn().mockReturnValue(user)
    userRepository.lockUntil = jest.fn()
    userRepository.updateLockCounter = jest.fn()
  })

  it('should lock a user if the number of failed login attempts is breached', async () => {
    user.numberOfFailedAttempts = 5

    expect(await createUseCase().execute({ email: 'test@test.te' })).toEqual({ success: true })

    expect(userRepository.lockUntil).toHaveBeenCalledWith('123', expect.any(Date))
    expect(userRepository.updateLockCounter).toHaveBeenCalledWith('123', 0)
  })

  it('should update the lock counter if a user is not exceeding the max failed login attempts', async () => {
    user.numberOfFailedAttempts = 4

    expect(await createUseCase().execute({ email: 'test@test.te' })).toEqual({ success: true })

    expect(userRepository.lockUntil).not.toHaveBeenCalled()
    expect(userRepository.updateLockCounter).toHaveBeenCalledWith('123', 5)
  })

  it('should start the lock counter from default 0 it is not set', async () => {
    user.numberOfFailedAttempts = null

    expect(await createUseCase().execute({ email: 'test@test.te' })).toEqual({ success: true })

    expect(userRepository.lockUntil).not.toHaveBeenCalled()
    expect(userRepository.updateLockCounter).toHaveBeenCalledWith('123', 1)
  })

  it('should fail if user is not found', async () => {
    userRepository.findOneByEmail = jest.fn().mockReturnValue(null)

    expect(await createUseCase().execute({ email: 'test@test.te' })).toEqual({ success: false })

    expect(userRepository.lockUntil).not.toHaveBeenCalled()
    expect(userRepository.updateLockCounter).not.toHaveBeenCalled()
  })
})
