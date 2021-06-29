import { KeyParams } from '@standardnotes/auth'

export interface AuthHttpServiceInterface {
  getUserKeyParams(dto: { email?: string, uuid?: string, authenticated: boolean }): Promise<KeyParams>
  saveUserMFA(dto: { userUuid: string, mfaSecret: string }): Promise<string>
  getUserMFA(userUuid: string): Promise<string>
}
