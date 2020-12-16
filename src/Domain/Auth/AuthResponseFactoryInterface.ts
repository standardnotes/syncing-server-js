import { User } from '../User/User'

export interface AuthResponseFactoryInterface {
  createResponse(user: User, ...args: any[]): Promise<Record<string, unknown>>
}
