import { CurrentAuthResponse } from '../Auth/CurrentAuthResponse'
import { LegacyAuthResponse } from '../Auth/LegacyAuthResponse'

export type SignInResponse = {
  success: boolean
  authResponse?: CurrentAuthResponse | LegacyAuthResponse,
  errorMessage?: string
}
