import { KeyParams } from '@standardnotes/auth'

import { SessionPayload } from '../Session/SessionPayload'
import { AuthResponse } from './AuthResponse'

export interface AuthResponse20200115 extends AuthResponse {
  session: SessionPayload,
  key_params: KeyParams
}
