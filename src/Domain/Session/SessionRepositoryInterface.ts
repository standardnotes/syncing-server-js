import { Session } from './Session'

export interface SessionRepositoryInterface {
  findOneByUuid(uuid: string): Promise<Session | undefined>
  findOneByUuidAndUserUuid(uuid: string, userUuid: string): Promise<Session | undefined>
  deleteAllByUserUuidExceptOne(userUuid: string, currentSessionUuid: string): Promise<void>
  deleteOneByUuid(uuid: string): Promise<void>
}
