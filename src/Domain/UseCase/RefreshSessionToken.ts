import * as crypto from 'crypto'
import * as moment from 'moment'
import * as cryptoRandomString from 'crypto-random-string'

import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { SessionRepositoryInterface } from '../Session/SessionRepositoryInterface'
import { SessionServiceInterace } from '../Session/SessionServiceInterface'
import { RefreshSessionTokenResponse } from './RefreshSessionTokenResponse'
import { RefreshSessionTokenDTO } from './RefreshSessionTokenDTO'
import { SessionService } from '../Session/SessionService'

@injectable()
export class RefreshSessionToken {
  constructor(
    @inject(TYPES.SessionService) private sessionService: SessionServiceInterace,
    @inject(TYPES.SessionRepository) private sessionRepository: SessionRepositoryInterface,
    @inject(TYPES.ACCESS_TOKEN_AGE) private accessTokenAge: number,
    @inject(TYPES.REFRESH_TOKEN_AGE) private refreshTokenAge: number
  ) {
  }

  async execute(dto: RefreshSessionTokenDTO): Promise<RefreshSessionTokenResponse> {
    const session = await this.sessionService.getSessionFromToken(dto.accessToken)
    if (!session) {
      return {
        success: false,
        errorTag: 'invalid-parameters',
        errorMessage: 'The provided parameters are not valid.'
      }
    }

    if (!this.sessionService.isRefreshTokenValid(session, dto.refreshToken)) {
      return {
        success: false,
        errorTag: 'invalid-refresh-token',
        errorMessage: 'The refresh token is not valid.'
      }
    }

    if (session.refreshExpired()) {
      return {
        success: false,
        errorTag: 'expired-refresh-token',
        errorMessage: 'The refresh token has expired.',
      }
    }

    const accessToken = cryptoRandomString({ length: 16, type: 'url-safe' })
    const refreshToken = cryptoRandomString({ length: 16, type: 'url-safe' })

    const hashedAccessToken = crypto.createHash('sha256').update(accessToken).digest('hex')
    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex')

    await this.sessionRepository.updateHashedTokens(session.uuid, hashedAccessToken, hashedRefreshToken)

    const accessTokenExpiration = moment.utc().add(this.accessTokenAge, 'seconds').toDate()
    const refreshTokenExpiration = moment.utc().add(this.refreshTokenAge, 'seconds').toDate()
    await this.sessionRepository.updatedTokenExpirationDates(session.uuid, accessTokenExpiration, refreshTokenExpiration)

    return {
      success: true,
      sessionPayload: {
        access_token: `${SessionService.SESSION_TOKEN_VERSION}:${session.uuid}:${accessToken}`,
        refresh_token: `${SessionService.SESSION_TOKEN_VERSION}:${session.uuid}:${refreshToken}`,
        access_expiration: moment(accessTokenExpiration).valueOf(),
        refresh_expiration: moment(refreshTokenExpiration).valueOf()
      }
    }
  }
}
