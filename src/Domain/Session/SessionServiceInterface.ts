import { Session } from './Session'

export interface SessionServiceInterace {
  getSessionFromToken(token: string): Promise<Session | undefined>
  isRefreshTokenValid(session: Session, token: string): boolean
  getDeviceInfo(session: Session): string
}
