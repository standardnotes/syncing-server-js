import { injectable } from 'inversify'
import { EntityRepository, Repository } from 'typeorm'

import { User } from '../../Domain/User/User'
import { UserRepositoryInterface } from '../../Domain/User/UserRepositoryInterface'

@injectable()
@EntityRepository(User)
export class MySQLUserRepository extends Repository<User> implements UserRepositoryInterface {
  async resetLockCounters(uuid: string): Promise<void> {
    await this.createQueryBuilder('user')
    .update()
    .set({
      lockedUntil: null,
      numberOfFailedAttempts: 0
    })
    .where('uuid = :uuid', { uuid })
    .execute()
  }

  async findOneByUuid(uuid: string): Promise<User | undefined> {
    return this.createQueryBuilder('user')
      .where('user.uuid = :uuid', { uuid })
      .getOne()
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.createQueryBuilder('user')
      .where('user.email = :email', { email })
      .getOne()
  }
}
