import * as crypto from 'crypto'

import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { KeyParams } from './KeyParams'
import { KeyParamsFactoryInterface } from './KeyParamsFactoryInterface'
import { User } from './User'

@injectable()
export class KeyParamsFactory implements KeyParamsFactoryInterface {
  constructor (
    @inject(TYPES.PSEUDO_KEY_PARAMS_KEY) private pseudoKeyParamsKey: string
  ) {
  }

  createPseudoParams(email: string): KeyParams {
    return this.sortKeys({
      identifier: email,
      pw_nonce: crypto.createHash('sha256').update(`${email}${this.pseudoKeyParamsKey}`).digest('hex'),
      version: '004',
    })
  }

  create(user: User, authenticated: boolean): KeyParams {
    const keyParams: KeyParams = {
      version: user.version,
      identifier: user.email,
    }

    switch (user.version) {
    case '004':
      if (authenticated) {
        keyParams.created = user.kpCreated
        keyParams.origination = user.kpOrigination
      }
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

    return this.sortKeys(keyParams)
  }

  private sortKeys(keyParams: KeyParams): KeyParams {
    const sortedKeyParams: {[key: string]: string | number | undefined } = {}

    Object.keys(keyParams).sort().forEach(key => {
      sortedKeyParams[key] = keyParams[key]
    })

    return <KeyParams> sortedKeyParams
  }
}
