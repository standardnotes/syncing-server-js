import { Session } from './Session'

export interface SessionRepositoryInterface {
  findOneByUuid(uuid: string): Promise<Session | undefined>
  save(session: Session): Promise<Session>
}
