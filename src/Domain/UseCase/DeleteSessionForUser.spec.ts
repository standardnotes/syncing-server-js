import 'reflect-metadata'

import { Session } from '../Session/Session'
import { SessionRepositoryInterface } from '../Session/SessionRepositoryInterface'
import { SessionServiceInterace } from '../Session/SessionServiceInterface'

import { DeleteSessionForUser } from './DeleteSessionForUser'

describe('DeleteSessionForUser', () => {
  let sessionRepository: SessionRepositoryInterface
  let sessionService: SessionServiceInterace
  let session: Session

  const createUseCase = () => new DeleteSessionForUser(sessionRepository, sessionService)

  beforeEach(() => {
    session = {} as jest.Mocked<Session>
    session.uuid = '2-3-4'
    session.userUuid = '1-2-3'

    sessionRepository = {} as jest.Mocked<SessionRepositoryInterface>
    sessionRepository.deleteOneByUuid = jest.fn()
    sessionRepository.findOneByUuidAndUserUuid = jest.fn().mockReturnValue(session)

    sessionService = {} as jest.Mocked<SessionServiceInterace>
    sessionService.archiveSession = jest.fn()
  })

  it('should delete a session for a given user', async () => {
    expect(await createUseCase().execute({ userUuid: '1-2-3', sessionUuid: '2-3-4' }))
      .toEqual({ success: true })

    expect(sessionRepository.deleteOneByUuid).toHaveBeenCalledWith('2-3-4')
    expect(sessionService.archiveSession).toHaveBeenCalledWith(session)
  })

  it('should not delete a session if it does not exist for a given user', async () => {
    sessionRepository.findOneByUuidAndUserUuid = jest.fn().mockReturnValue(null)

    expect(await createUseCase().execute({ userUuid: '1-2-3', sessionUuid: '2-3-4' }))
      .toEqual({ success: false, errorMessage: 'No session exists with the provided identifier.' })

    expect(sessionRepository.deleteOneByUuid).not.toHaveBeenCalled()
    expect(sessionService.archiveSession).not.toHaveBeenCalled()
  })
})
