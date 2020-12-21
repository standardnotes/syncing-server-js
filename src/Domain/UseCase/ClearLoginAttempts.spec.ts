import 'reflect-metadata'
import { Logger } from 'winston'

import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { ClearLoginAttempts } from './ClearLoginAttempts'

describe('ClearLoginAttempts', () => {
  let userRepository: UserRepositoryInterface
  let user: User
  let logger: Logger

  const createUseCase = () => new ClearLoginAttempts(userRepository, logger)

  beforeEach(() => {
    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()

    user = {} as jest.Mocked<User>
    user.uuid = '234'

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.resetLockCounter = jest.fn()
    userRepository.findOneByEmail = jest.fn().mockReturnValue(user)
  })

  it('should unlock an user by email', async () => {
    expect(await createUseCase().execute({ email: 'test@test.te' })).toEqual({ success: true })

    expect(userRepository.resetLockCounter).toHaveBeenCalledWith('234')
  })

  it('should unlock an user by email if user does not exist', async () => {
    userRepository.findOneByEmail = jest.fn().mockReturnValue(null)

    expect(await createUseCase().execute({ email: 'test@test.te' })).toEqual({ success: false })

    expect(userRepository.resetLockCounter).not.toHaveBeenCalled()
  })
})
