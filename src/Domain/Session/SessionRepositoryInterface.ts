import { Session } from './Session'

export interface SessionRepositoryInterface {
  findOneByUuid(uuid: string): Promise<Session | undefined>
  deleteAllByUserUuidExceptOne(userUuid: string, currentSessionUuid: string): Promise<void>
}
