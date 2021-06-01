import { RevokedSession } from './RevokedSession'
import { Session } from './Session'

export interface SessionServiceInterace {
  getSessionFromToken(token: string): Promise<Session | undefined>
  getRevokedSessionFromToken(token: string): Promise<RevokedSession | undefined>
  markRevokedSessionAsReceived(revokedSession: RevokedSession): Promise<RevokedSession>
  getDeviceInfo(session: Session): string
}
