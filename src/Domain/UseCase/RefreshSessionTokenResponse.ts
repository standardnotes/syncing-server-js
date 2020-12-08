import { SessionPayload } from '../Session/SessionPayload'

export type RefreshSessionTokenResponse = {
  success: boolean,
  errorTag?: string,
  errorMessage?: string,
  sessionPayload?: SessionPayload
}
