import { injectable } from 'inversify'
import { EntityRepository, Repository } from 'typeorm'

import { Session } from '../../Domain/Session/Session'
import { SessionRepositoryInterface } from '../../Domain/Session/SessionRepositoryInterface'

@injectable()
@EntityRepository(Session)
export class MySQLSessionRepository extends Repository<Session> implements SessionRepositoryInterface {
  async findActiveByUserUuid(userUuid: string): Promise<Session[]> {
    return this.createQueryBuilder('session')
      .where(
        'session.refresh_expiration > :refresh_expiration AND session.user_uuid = :user_uuid',
        { refresh_expiration: new Date(), user_uuid: userUuid }
      )
      .getMany()
  }

  async findOneByUuidAndUserUuid(uuid: string, userUuid: string): Promise<Session | undefined> {
    return this.createQueryBuilder('session')
      .where('session.uuid = :uuid AND session.user_uuid = :user_uuid', { uuid, user_uuid: userUuid })
      .getOne()
  }

  async deleteOneByUuid(uuid: string): Promise<void> {
    await this.createQueryBuilder('session')
      .delete()
      .where('session.uuid = :uuid', { uuid })
      .execute()
  }

  async findOneByUuid(uuid: string): Promise<Session | undefined> {
    return this.createQueryBuilder('session')
      .where('session.uuid = :uuid', { uuid })
      .getOne()
  }

  async deleteAllByUserUuidExceptOne(userUuid: string, currentSessionUuid: string): Promise<void> {
    await this.createQueryBuilder('session')
      .delete()
      .where(
        'session.user_uuid = :user_uuid AND session.uuid != :current_session_uuid',
        {
          user_uuid: userUuid,
          current_session_uuid: currentSessionUuid
        }
      )
      .execute()
  }
}
