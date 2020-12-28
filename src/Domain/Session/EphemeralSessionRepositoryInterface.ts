import { EphemeralSession } from './EphemeralSession'

export interface EphemeralSessionRepositoryInterface {
  save(ephemeralSession: EphemeralSession): Promise<EphemeralSession>
}
