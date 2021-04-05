import { KeyParams } from '@standardnotes/auth'

export interface AuthHttpServiceInterface {
  getUserKeyParams(email: string, authenticated: boolean): Promise<KeyParams>
}
