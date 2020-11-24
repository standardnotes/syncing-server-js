import { Session } from '../Session/Session'
import { User } from '../User/User'

export type AuthenticationMethod = {
  type: 'jwt' | 'session_token',
  user: User | undefined,
  claims?: Record<string, unknown>,
  session?: Session
}
