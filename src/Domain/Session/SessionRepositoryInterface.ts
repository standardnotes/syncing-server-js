import { Session } from './Session'

export interface SessionRepositoryInterface {
  findOneByToken(token: string): Promise<Session | undefined>
}
