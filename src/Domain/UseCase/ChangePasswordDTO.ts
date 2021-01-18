import { User } from '../User/User'

export type ChangePasswordDTO = {
  user: User
  apiVersion: string
  currentPassword: string
  newPassword: string
  pwNonce: string
  updatedWithUserAgent: string
  protocolVersion?: string
}
