import 'reflect-metadata'
import { SessionRepositoryInterface } from '../Session/SessionRepositoryInterface'

import { DeletePreviousSessionsForUser } from './DeletePreviousSessionsForUser'

describe('DeletePreviousSessionsForUser', () => {
  let sessionRepository: SessionRepositoryInterface

  const createUseCase = () => new DeletePreviousSessionsForUser(sessionRepository)

  beforeEach(() => {
    sessionRepository = {} as jest.Mocked<SessionRepositoryInterface>
    sessionRepository.deleteAllByUserUuid = jest.fn()
  })

  it('should delete all sessions except current for a given user', async () => {
    expect(await createUseCase().execute({ userUuid: '1-2-3', currentSessionUuid: '2-3-4' }))
      .toEqual({ success: true })

    expect(sessionRepository.deleteAllByUserUuid).toHaveBeenCalledWith('1-2-3', '2-3-4')
  })
})
