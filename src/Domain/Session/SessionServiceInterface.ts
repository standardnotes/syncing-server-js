import { User } from '../User/User'
import { RevokedSession } from './RevokedSession'
import { Session } from './Session'
import { SessionPayload } from './SessionPayload'

export interface SessionServiceInterace {
  createNewSessionForUser(user: User, apiVersion: string, userAgent: string): Promise<SessionPayload>
  createNewEphemeralSessionForUser(user: User, apiVersion: string, userAgent: string): Promise<SessionPayload>
  refreshTokens(session: Session): Promise<SessionPayload>
  getSessionFromToken(token: string): Promise<Session | undefined>
  getRevokedSessionFromToken(token: string): Promise<RevokedSession | undefined>
  markRevokedSessionAsReceived(revokedSession: RevokedSession): Promise<RevokedSession>
  deleteSessionByToken(token: string): Promise<void>
  isRefreshTokenValid(session: Session, token: string): boolean
  getDeviceInfo(session: Session): string
  revokeSession(session: Session): Promise<RevokedSession>
}
