import { verify } from 'jsonwebtoken'

import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { TokenDecoderInterface } from './TokenDecoderInterface'

@injectable()
export class TokenDecoder implements TokenDecoderInterface {
  constructor(
    @inject(TYPES.JWT_SECRET) private jwtSecret: string,
    @inject(TYPES.LEGACY_JWT_SECRET) private legacyJwtSecret: string
  ) {
  }

  decode(token: string): Record<string, unknown> | undefined {
    try {
      return <Record<string, unknown>> verify(token, this.jwtSecret, {
        algorithms: [ 'HS256' ],
      })
    } catch (error) {
      try {
        return <Record<string, unknown>> verify(token, this.legacyJwtSecret, {
          algorithms: [ 'HS256' ],
        })
      } catch (legacyError) {
        return undefined
      }
    }
  }
}
