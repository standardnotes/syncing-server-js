import { EphemeralSession } from './EphemeralSession'

export interface EphemeralSessionRepositoryInterface {
  findOneByUuid(uuid: string): Promise<EphemeralSession | undefined>
  updateTokensAndExpirationDates(uuid: string, hashedAccessToken: string, hashedRefreshToken: string, accessExpiration: Date, refreshExpiration: Date): Promise<void>
  deleteOneByUuid(uuid: string): Promise<void>
  save(ephemeralSession: EphemeralSession): Promise<void>
}
