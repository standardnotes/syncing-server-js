import { Session } from '../Session/Session'
import { User } from '../User/User'

export type AuthenticateUserResponse = {
  success: boolean,
  failureType?: 'INVALID_AUTH' | 'EXPIRED_TOKEN',
  user?: User,
  session?: Session
}
