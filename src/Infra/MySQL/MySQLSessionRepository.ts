import { injectable } from 'inversify'
import { EntityRepository, Repository } from 'typeorm'

import { Session } from '../../Domain/Session/Session'
import { SessionRepositoryInterface } from '../../Domain/Session/SessionRepositoryInterface'

@injectable()
@EntityRepository(Session)
export class MySQLSessionRepository extends Repository<Session> implements SessionRepositoryInterface {
  async findOneByUuid(uuid: string): Promise<Session | undefined> {
    return this.createQueryBuilder('session')
      .where('session.uuid = :uuid', { uuid })
      .getOne()
  }

  async deleteAllByUserUuidExceptOne(userUuid: string, currentSessionUuid: string): Promise<void> {
    await this.createQueryBuilder('session')
      .delete()
      .where(
        'user_uuid = :user_uuid AND uuid != :current_session_uuid',
        {
          user_uuid: userUuid,
          current_session_uuid: currentSessionUuid
        }
      )
      .execute()
  }
}
