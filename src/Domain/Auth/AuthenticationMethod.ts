import { ArchivedSession } from '../Session/ArchivedSession'
import { Session } from '../Session/Session'
import { User } from '../User/User'

export type AuthenticationMethod = {
  type: 'jwt' | 'session_token' | 'archived'
  user?: User
  claims?: Record<string, unknown>
  session?: Session
  archivedSession?: ArchivedSession
}
