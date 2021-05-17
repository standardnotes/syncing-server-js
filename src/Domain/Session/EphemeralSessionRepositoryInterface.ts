import { EphemeralSession } from './EphemeralSession'

export interface EphemeralSessionRepositoryInterface {
  findOneByUuid(uuid: string): Promise<EphemeralSession | undefined>
  findAllByUserUuid(userUuid: string): Promise<Array<EphemeralSession>>
  updateTokensAndExpirationDates(uuid: string, hashedAccessToken: string, hashedRefreshToken: string, accessExpiration: Date, refreshExpiration: Date): Promise<void>
  deleteOne(uuid: string, userUuid: string): Promise<void>
  save(ephemeralSession: EphemeralSession): Promise<void>
}
