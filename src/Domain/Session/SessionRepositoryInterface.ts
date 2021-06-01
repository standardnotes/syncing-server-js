import { Session } from './Session'

export interface SessionRepositoryInterface {
  findOneByUuid(uuid: string): Promise<Session | undefined>
  findAllByRefreshExpirationAndUserUuid(userUuid: string): Promise<Array<Session>>
  findAllByUserUuid(userUuid: string): Promise<Array<Session>>
  updateHashedTokens(uuid: string, hashedAccessToken: string, hashedRefreshToken: string): Promise<void>
  updatedTokenExpirationDates(uuid: string, accessExpiration: Date, refreshExpiration: Date): Promise<void>
  save(session: Session): Promise<Session>
}
