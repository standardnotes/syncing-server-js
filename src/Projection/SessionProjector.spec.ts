import 'reflect-metadata'
import * as moment from 'moment'

import { SessionServiceInterace } from '../Domain/Session/SessionServiceInterface'
import { SessionProjector } from './SessionProjector'
import { Session } from '../Domain/Session/Session'

describe('SessionProjector', () => {
  let session: Session
  let currentSession: Session
  let sessionService: SessionServiceInterace

  const createProjector = () => new SessionProjector(sessionService)

  beforeEach(() => {
    session = new Session()
    session.uuid = '123'
    session.hashedAccessToken = 'hashed access token'
    session.userUuid = '234'
    session.apiVersion = '004'
    session.createdAt = moment.utc('2020-11-26 13:34').toDate()
    session.updatedAt = moment.utc('2020-11-26 13:34').toDate()

    currentSession = new Session()
    currentSession.uuid = '234'

    sessionService = {} as jest.Mocked<SessionServiceInterace>
    sessionService.getDeviceInfo = jest.fn().mockReturnValue('Some Device Info')
  })

  it('should create a simple projection of a session', () => {
    const projection = createProjector().projectSimple(session)
    expect(projection).toMatchObject({
      uuid: '123',
      api_version: '004',
      created_at: '2020-11-26T13:34:00.000Z',
      updated_at: '2020-11-26T13:34:00.000Z',
      device_info: 'Some Device Info'
    })
  })

  it('should create a custom projection of a session', () => {
    const projection = createProjector().projectCustom(
      SessionProjector.CURRENT_SESSION_PROJECTION.toString(),
      session,
      currentSession
    )

    expect(projection).toMatchObject({
      uuid: '123',
      api_version: '004',
      created_at: '2020-11-26T13:34:00.000Z',
      updated_at: '2020-11-26T13:34:00.000Z',
      device_info: 'Some Device Info',
      current: false
    })
  })

  it('should create a custom projection of a current session', () => {
    currentSession.uuid = '123'

    const projection = createProjector().projectCustom(
      SessionProjector.CURRENT_SESSION_PROJECTION.toString(),
      session,
      currentSession
    )

    expect(projection).toMatchObject({
      uuid: '123',
      api_version: '004',
      created_at: '2020-11-26T13:34:00.000Z',
      updated_at: '2020-11-26T13:34:00.000Z',
      device_info: 'Some Device Info',
      current: true
    })
  })

  it('should throw error on unknown custom projection', () => {
    let error = null
    try {
      createProjector().projectCustom(
        'test',
        session,
        currentSession
      )
    } catch (e) {
      error = e
    }
    expect(error.message).toEqual('Not supported projection type: test')
  })

  it('should throw error on not implemetned full projection', () => {
    let error = null
    try {
      createProjector().projectFull(session)
    } catch (e) {
      error = e
    }
    expect(error.message).toEqual('not implemented')
  })
})
