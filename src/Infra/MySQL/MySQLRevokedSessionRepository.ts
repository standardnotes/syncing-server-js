import { injectable } from 'inversify'
import { EntityRepository, Repository } from 'typeorm'
import { RevokedSession } from '../../Domain/Session/RevokedSession'
import { RevokedSessionRepositoryInterface } from '../../Domain/Session/RevokedSessionRepositoryInterface'

@injectable()
@EntityRepository(RevokedSession)
export class MySQLRevokedSessionRepository extends Repository<RevokedSession> implements RevokedSessionRepositoryInterface {
  async updateRetrieved(uuid: string, retrieved: boolean): Promise<void> {
    await this.createQueryBuilder('session')
      .update()
      .set({
        retrieved
      })
      .where('uuid = :uuid', { uuid })
      .execute()
  }

  async findOneByUuid(uuid: string): Promise<RevokedSession | undefined> {
    return this.createQueryBuilder('revoked_session')
      .where('revoked_session.uuid = :uuid', { uuid })
      .getOne()
  }
}
