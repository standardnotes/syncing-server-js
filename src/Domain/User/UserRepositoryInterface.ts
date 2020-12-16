import { User } from './User'

export interface UserRepositoryInterface {
  findOneByUuid(uuid: string): Promise<User | undefined>
  findOneByEmail(email: string): Promise<User | undefined>
  resetLockCounter(uuid: string): Promise<void>
  updateLockCounter(uuid: string, counter: number): Promise<void>
  lockUntil(uuid: string, date: Date): Promise<void>
}
