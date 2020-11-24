import { User } from './User'

export interface UserRepositoryInterface {
  findOneById(id: string): Promise<User | undefined>
}
