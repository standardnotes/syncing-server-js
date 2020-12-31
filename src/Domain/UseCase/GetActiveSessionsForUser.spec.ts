import 'reflect-metadata'
import { Session } from '../Session/Session'
import { SessionRepositoryInterface } from '../Session/SessionRepositoryInterface'

import { GetActiveSessionsForUser } from './GetActiveSessionsForUser'

describe('GetActiveSessionsForUser', () => {
  let sessionRepository: SessionRepositoryInterface
  let session: Session

  const createUseCase = () => new GetActiveSessionsForUser(sessionRepository)

  beforeEach(() => {
    session = {} as jest.Mocked<Session>
    session.uuid = '2e1e43'

    sessionRepository = {} as jest.Mocked<SessionRepositoryInterface>
    sessionRepository.findAllByRefreshExpirationAndUserUuid = jest.fn().mockReturnValue([ session ])
  })

  it('should get all active sessions for a user', async () => {
    expect(await createUseCase().execute({ userUuid: '1-2-3' })).toEqual({ sessions: [ session ] })

    expect(sessionRepository.findAllByRefreshExpirationAndUserUuid).toHaveBeenCalledWith('1-2-3')
  })
})
