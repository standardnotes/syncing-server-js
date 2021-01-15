import { RevokedSession } from './RevokedSession'

export interface RevokedSessionRepositoryInterface {
  findOneByUuid(uuid: string): Promise<RevokedSession | undefined>
  save(revokedSession: RevokedSession): Promise<RevokedSession>
}
