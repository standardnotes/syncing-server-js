import { KeyParams } from './KeyParams'
import { User } from './User'

export interface KeyParamsFactoryInterface {
  create(user: User): KeyParams
}
