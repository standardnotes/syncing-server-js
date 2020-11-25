import { inject } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { Session } from './Session'
import { SessionRepositoryInterface } from './SessionRepositoryInterface'
import { SessionServiceInterace } from './SessionServiceInterface'

export class SessionService implements SessionServiceInterace {
  constructor (
    @inject(TYPES.SessionRepository) private sessionRepository: SessionRepositoryInterface
  ) {
  }

  async getSessionFromToken(_token: string): Promise<Session | undefined> {
    // _version, session_id, access_token = Session.deconstruct_token(request_token)
    // session = Session.find_by_uuid(session_id)
    // if session && !access_token.nil?
    //   return session if ActiveSupport::SecurityUtils.secure_compare(
    //     session.hashed_access_token,
    //     Session.hash_string(access_token)
    //   )
    // end

    // const [_version, sessionId, accessToken] = token.split(':')

    return undefined
  }
}
