import 'reflect-metadata'

import { Session } from './Session'
import { SessionRepositoryInterface } from './SessionRepositoryInterface'
import { SessionService } from './SessionService'

describe('SessionService', () => {
  let sessionRepository: SessionRepositoryInterface
  let session: Session

  const createService = () => new SessionService(sessionRepository)

  beforeEach(() => {
    sessionRepository = {} as jest.Mocked<SessionRepositoryInterface>
    sessionRepository.findOneByUuid = jest.fn()

    session = {} as jest.Mocked<Session>
    session.hashedAccessToken = '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce'
  })

  it('should retrieve a session from a session token', async () => {
    sessionRepository.findOneByUuid = jest.fn().mockImplementation((uuid) => {
      if (uuid === '2') {
        return session
      }

      return undefined
    })

    const result = await createService().getSessionFromToken('1:2:3')

    expect(result).toEqual(session)
  })

  it('should not retrieve a session from a session token that has access token missing', async () => {
    sessionRepository.findOneByUuid = jest.fn().mockImplementation((uuid) => {
      if (uuid === '2') {
        return session
      }

      return undefined
    })

    const result = await createService().getSessionFromToken('1:2')

    expect(result).toBeUndefined()
  })

  it('should not retrieve a session that is missing', async () => {
    sessionRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    const result = await createService().getSessionFromToken('1:2:3')

    expect(result).toBeUndefined()
  })

  it('should not retrieve a session from a session token that has invalid access token', async () => {
    sessionRepository.findOneByUuid = jest.fn().mockImplementation((uuid) => {
      if (uuid === '2') {
        return session
      }

      return undefined
    })

    const result = await createService().getSessionFromToken('1:2:4')

    expect(result).toBeUndefined()
  })
})
