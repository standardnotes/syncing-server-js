import { User } from '../User/User'

export type GetUserKeyParamsDTO = {
  email: string
  authenticatedUser?: User
}
