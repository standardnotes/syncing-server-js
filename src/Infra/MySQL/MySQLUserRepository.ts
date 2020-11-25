import { injectable } from 'inversify'
import { Repository } from 'typeorm'

import { User } from '../../Domain/User/User'
import { UserRepositoryInterface } from '../../Domain/User/UserRepositoryInterface'

@injectable()
export class MySQLUserRepository extends Repository<User> implements UserRepositoryInterface {
  async findOneByUuid(uuid: string): Promise<User | undefined> {
    return this.createQueryBuilder('user')
      .where('user.uuid = :uuid', { uuid })
      .getOne()
  }
}
