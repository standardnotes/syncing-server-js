import { Session } from './Session'

export interface SessionRepositoryInterface {
  findOneByUuid(sessionUuid: string): Promise<Session | undefined>
}
