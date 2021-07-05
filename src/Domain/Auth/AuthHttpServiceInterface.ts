import { KeyParams } from '@standardnotes/auth'

export interface AuthHttpServiceInterface {
  getUserKeyParams(dto: { email?: string, uuid?: string, authenticated: boolean }): Promise<KeyParams>
  removeUserMFA(userUuid: string): Promise<void>
  saveUserMFA(dto: {
    uuid: string,
    userUuid: string,
    encodedMfaSecret: string,
    createdAt: number,
    updatedAt: number
  }): Promise<string>
  getUserMFA(userUuid: string): Promise<{
    uuid: string,
    name: string,
    value: string,
    createdAt: number,
    updatedAt: number
  }>
}
