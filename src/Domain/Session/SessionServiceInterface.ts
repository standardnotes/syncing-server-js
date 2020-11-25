import { Session } from './Session'

export interface SessionServiceInterace {
  getSessionFromToken(token: string): Promise<Session | undefined>
}
