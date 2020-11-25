export class SessionService {
  constructor (

  ) {

  }
  async getSessionFromToken(token: string): Promise<Session | undefined> {
    // _version, session_id, access_token = Session.deconstruct_token(request_token)
    // session = Session.find_by_uuid(session_id)
    // if session && !access_token.nil?
    //   return session if ActiveSupport::SecurityUtils.secure_compare(
    //     session.hashed_access_token,
    //     Session.hash_string(access_token)
    //   )
    // end

    const [_version, sessionId, accessToken] = token.split(':')

  }
}
