import { KeyParams } from '@standardnotes/auth'

export interface AuthHttpServiceInterface {
  getUserKeyParams(dto: { email?: string, uuid?: string, authenticated: boolean }): Promise<KeyParams>
  saveUserMFA(dto: { uuid: string, userUuid: string, mfaSecret: string }): Promise<string>
  getUserMFA(userUuid: string): Promise<{
    uuid: string,
    name: string,
    value: string,
    createdAt: string,
    updatedAt: string
  }>
}
