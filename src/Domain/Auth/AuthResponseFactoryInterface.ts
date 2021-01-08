import { User } from '../User/User'
import { AuthResponse20161215 } from './AuthResponse20161215'
import { AuthResponse20200115 } from './AuthResponse20200115'

export interface AuthResponseFactoryInterface {
  createResponse(user: User, ...args: any[]): Promise<AuthResponse20161215 | AuthResponse20200115>
}
