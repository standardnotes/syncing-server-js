import { injectable } from 'inversify'

import { User } from '../../Domain/User/User'
import { UserRepositoryInterface } from '../../Domain/User/UserRepositoryInterface'

@injectable()
export class InMemoryUserRepository implements UserRepositoryInterface {
  async findOneByUuid(_uuid: string): Promise<User | undefined> {
    const user = new User()
    user.encryptedPassword = 'test'

    return user
  }
}
