import 'reflect-metadata'
import { Session } from '../Session/Session'
import { SessionRepositoryInterface } from '../Session/SessionRepositoryInterface'
import { SessionServiceInterace } from '../Session/SessionServiceInterface'

import { DeletePreviousSessionsForUser } from './DeletePreviousSessionsForUser'

describe('DeletePreviousSessionsForUser', () => {
  let sessionRepository: SessionRepositoryInterface
  let sessionService: SessionServiceInterace
  let session: Session
  let currentSession: Session

  const createUseCase = () => new DeletePreviousSessionsForUser(sessionRepository, sessionService)

  beforeEach(() => {
    session = {} as jest.Mocked<Session>
    session.uuid = '1-2-3'

    currentSession = {} as jest.Mocked<Session>
    currentSession.uuid = '2-3-4'

    sessionRepository = {} as jest.Mocked<SessionRepositoryInterface>
    sessionRepository.deleteAllByUserUuid = jest.fn()
    sessionRepository.findAllByUserUuid = jest.fn().mockReturnValue([ session, currentSession ])

    sessionService = {} as jest.Mocked<SessionServiceInterace>
    sessionService.revokeSession = jest.fn()
  })

  it('should delete all sessions except current for a given user', async () => {
    expect(await createUseCase().execute({ userUuid: '1-2-3', currentSessionUuid: '2-3-4' }))
      .toEqual({ success: true })

    expect(sessionRepository.deleteAllByUserUuid).toHaveBeenCalledWith('1-2-3', '2-3-4')

    expect(sessionService.revokeSession).toHaveBeenCalledWith(session)
    expect(sessionService.revokeSession).not.toHaveBeenCalledWith(currentSession)
  })
})
