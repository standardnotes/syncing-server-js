import { injectable } from 'inversify'

import { User } from '../../Domain/User/User'
import { UserRepositoryInterface } from '../../Domain/User/UserRepositoryInterface'

@injectable()
export class InMemoryUserRepository implements UserRepositoryInterface {
  async findOneById(_id: string): Promise<User | undefined> {
    return {
      supportsSessions: false,
      encryptedPassword: 'test'
    }
  }
}
