import { SessionPayload } from '../Session/SessionPayload'
import { KeyParams } from '../User/KeyParams'

export type CurrentAuthResponse = {
  session: SessionPayload
  key_params: KeyParams
  user: Record<string, unknown>
}
