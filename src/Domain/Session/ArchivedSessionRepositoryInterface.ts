import { ArchivedSession } from './ArchivedSession'

export interface ArchivedSessionRepositoryInterface {
  findOneByUuid(uuid: string): Promise<ArchivedSession | undefined>
  save(archivedSession: ArchivedSession): Promise<ArchivedSession>
}
