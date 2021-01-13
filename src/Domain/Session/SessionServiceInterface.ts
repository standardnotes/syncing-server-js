import { User } from '../User/User'
import { RevokedSession } from './RevokedSession'
import { EphemeralSession } from './EphemeralSession'
import { Session } from './Session'
import { SessionPayload } from './SessionPayload'

export interface SessionServiceInterace {
  createNewSessionForUser(user: User, apiVersion: string, userAgent: string): Promise<Session>
  createNewEphemeralSessionForUser(user: User, apiVersion: string, userAgent: string): Promise<EphemeralSession>
  createTokens(session: Session): Promise<SessionPayload>
  getSessionFromToken(token: string): Promise<Session | undefined>
  getRevokedSessionFromToken(token: string): Promise<RevokedSession | undefined>
  deleteSessionByToken(token: string): Promise<void>
  isRefreshTokenValid(session: Session, token: string): boolean
  getDeviceInfo(session: Session): string
  revokeSession(session: Session): Promise<RevokedSession>
}
