import { injectable } from 'inversify'
import { EntityRepository, Repository } from 'typeorm'
import { ArchivedSession } from '../../Domain/Session/ArchivedSession'
import { ArchivedSessionRepositoryInterface } from '../../Domain/Session/ArchivedSessionRepositoryInterface'

@injectable()
@EntityRepository(ArchivedSession)
export class MySQLArchivedSessionRepository extends Repository<ArchivedSession> implements ArchivedSessionRepositoryInterface {
  async findOneByUuid(uuid: string): Promise<ArchivedSession | undefined> {
    return this.createQueryBuilder('archived_session')
      .where('archived_session.uuid = :uuid', { uuid })
      .getOne()
  }
}
