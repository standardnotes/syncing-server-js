import { SessionPayload } from '../Session/SessionPayload'
import { KeyParams } from '../User/KeyParams'
import { AuthResponse } from './AuthResponse'

export interface AuthResponse20200115 extends AuthResponse {
  session: SessionPayload,
  key_params: KeyParams
}
