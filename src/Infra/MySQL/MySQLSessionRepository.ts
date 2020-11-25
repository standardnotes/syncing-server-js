import { injectable } from 'inversify'
import { EntityRepository, Repository } from 'typeorm'

import { Session } from '../../Domain/Session/Session'
import { SessionRepositoryInterface } from '../../Domain/Session/SessionRepositoryInterface'

@injectable()
@EntityRepository()
export class MySQLSessionRepository extends Repository<Session> implements SessionRepositoryInterface {
  async findOneByUuid(uuid: string): Promise<Session | undefined> {
    return this.createQueryBuilder('session')
      .where('session.uuid = :uuid', { uuid })
      .getOne()
  }
}
