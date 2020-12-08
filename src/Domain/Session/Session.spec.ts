import * as moment from 'moment'

import { Session } from './Session'

describe('Session', () => {
  const createSession = () => new Session()

  it('should indicate if access token is expired', () => {
    const session = createSession()
    const date = moment.utc().toDate()
    date.setDate(date.getDate() - 5)
    session.accessExpiration = date

    expect(session.accessExpired()).toBeTruthy()
  })

  it('should indicate if access token is not expired', () => {
    const session = createSession()
    const date = moment.utc().toDate()
    date.setDate(date.getDate() + 5)
    session.accessExpiration = date

    expect(session.accessExpired()).toBeFalsy()
  })

  it('should indicate if refresh token is expired', () => {
    const session = createSession()
    const date = moment.utc().toDate()
    date.setDate(date.getDate() - 5)
    session.refreshExpiration = date

    expect(session.refreshExpired()).toBeTruthy()
  })

  it('should indicate if refresh token is not expired', () => {
    const session = createSession()
    const date = moment.utc().toDate()
    date.setDate(date.getDate() + 5)
    session.refreshExpiration = date

    expect(session.refreshExpired()).toBeFalsy()
  })
})
