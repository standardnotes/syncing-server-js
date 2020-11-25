import { injectable } from 'inversify'
import { EntityRepository, Repository } from 'typeorm'

import { User } from '../../Domain/User/User'
import { UserRepositoryInterface } from '../../Domain/User/UserRepositoryInterface'

@injectable()
@EntityRepository(User)
export class MySQLUserRepository extends Repository<User> implements UserRepositoryInterface {
  async findOneByUuid(uuid: string): Promise<User | undefined> {
    return this.createQueryBuilder('user')
      .where('user.uuid = :uuid', { uuid })
      .getOne()
  }
}
