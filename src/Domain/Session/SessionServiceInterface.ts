import { Session } from './Session'

export interface SessionServiceInterace {
  getSessionFromToken(token: string): Promise<Session | undefined>
  deleteSessionByToken(token: string): Promise<void>
  isRefreshTokenValid(session: Session, token: string): boolean
  getDeviceInfo(session: Session): string
}
