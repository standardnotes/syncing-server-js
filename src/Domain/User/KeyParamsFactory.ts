import { injectable } from 'inversify'
import { KeyParams } from './KeyParams'
import { KeyParamsFactoryInterface } from './KeyParamsFactoryInterface'
import { User } from './User'

@injectable()
export class KeyParamsFactory implements KeyParamsFactoryInterface {
  create(user: User): KeyParams {
    const keyParams: KeyParams = {
      version: user.version,
      identifier: user.email
    }

    switch (user.version) {
      case '004':
        keyParams.created = user.kpCreated
        keyParams.origination = user.kpOrigination
        keyParams.pw_nonce = user.pwNonce
        break
      case '003':
        keyParams.pw_nonce = user.pwNonce
        keyParams.pw_cost = user.pwCost
        break
      case '002':
        keyParams.email = user.email
        keyParams.pw_cost = user.pwCost
        keyParams.pw_salt = user.pwSalt
        break
      case '001':
        keyParams.email = user.email
        keyParams.pw_alg = user.pwAlg
        keyParams.pw_cost = user.pwCost
        keyParams.pw_func = user.pwFunc
        keyParams.pw_salt = user.pwSalt
        keyParams.pw_key_size = user.pwKeySize
        break
    }

    return keyParams
  }
}
