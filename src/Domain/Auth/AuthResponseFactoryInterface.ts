import { User } from '../User/User'
import { CurrentAuthResponse } from './CurrentAuthResponse'
import { LegacyAuthResponse } from './LegacyAuthResponse'

export interface AuthResponseFactoryInterface {
  createSuccessAuthResponse(user: User, apiVersion: string, userAgent: string): Promise<CurrentAuthResponse | LegacyAuthResponse>
}
