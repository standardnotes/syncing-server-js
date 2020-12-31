import * as dayjs from 'dayjs'

import { injectable } from 'inversify'
import { EntityRepository, Repository } from 'typeorm'

import { Session } from '../../Domain/Session/Session'
import { SessionRepositoryInterface } from '../../Domain/Session/SessionRepositoryInterface'

@injectable()
@EntityRepository(Session)
export class MySQLSessionRepository extends Repository<Session> implements SessionRepositoryInterface {
  async updateHashedTokens(uuid: string, hashedAccessToken: string, hashedRefreshToken: string): Promise<void> {
    await this.createQueryBuilder('session')
      .update()
      .set({
        hashedAccessToken,
        hashedRefreshToken
      })
      .where('uuid = :uuid', { uuid })
      .execute()
  }

  async updatedTokenExpirationDates(uuid: string, accessExpiration: Date, refreshExpiration: Date): Promise<void> {
    await this.createQueryBuilder('session')
      .update()
      .set({
        accessExpiration,
        refreshExpiration
      })
      .where('uuid = :uuid', { uuid })
      .execute()
  }

  async findAllByRefreshExpirationAndUserUuid(userUuid: string): Promise<Session[]> {
    return this.createQueryBuilder('session')
      .where(
        'session.refresh_expiration > :refresh_expiration AND session.user_uuid = :user_uuid',
        { refresh_expiration: dayjs.utc().toDate(), user_uuid: userUuid }
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
      .where('uuid = :uuid', { uuid })
      .execute()
  }

  async findOneByUuid(uuid: string): Promise<Session | undefined> {
    return this.createQueryBuilder('session')
      .where('session.uuid = :uuid', { uuid })
      .getOne()
  }

  async deleteAllByUserUuid(userUuid: string, currentSessionUuid: string): Promise<void> {
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
