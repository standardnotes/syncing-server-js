import * as crypto from 'crypto'
import * as winston from 'winston'
import * as dayjs from 'dayjs'
import * as cryptoRandomString from 'crypto-random-string'
import DeviceDetector = require('device-detector-js')
import { inject, injectable } from 'inversify'
import { v4 as uuidv4 } from 'uuid'

import TYPES from '../../Bootstrap/Types'
import { Session } from './Session'
import { SessionRepositoryInterface } from './SessionRepositoryInterface'
import { SessionServiceInterace } from './SessionServiceInterface'
import { SessionPayload } from './SessionPayload'
import { User } from '../User/User'

@injectable()
export class SessionService implements SessionServiceInterace {
  static readonly SESSION_TOKEN_VERSION = 1

  constructor (
    @inject(TYPES.SessionRepository) private sessionRepository: SessionRepositoryInterface,
    @inject(TYPES.DeviceDetector) private deviceDetector: DeviceDetector,
    @inject(TYPES.Logger) private logger: winston.Logger,
    @inject(TYPES.ACCESS_TOKEN_AGE) private accessTokenAge: number,
    @inject(TYPES.REFRESH_TOKEN_AGE) private refreshTokenAge: number
  ) {
  }

  async createNewSessionForUser(user: User, apiVersion: string, userAgent: string): Promise<Session> {
    const session = new Session()
    session.uuid = uuidv4()
    session.userUuid = user.uuid
    session.apiVersion = apiVersion
    session.userAgent = userAgent
    session.createdAt = dayjs.utc().toDate()
    session.updatedAt = dayjs.utc().toDate()

    return this.sessionRepository.save(session)
  }

  async createTokens(session: Session): Promise<SessionPayload> {
    const accessToken = cryptoRandomString({ length: 16, type: 'url-safe' })
    const refreshToken = cryptoRandomString({ length: 16, type: 'url-safe' })

    const hashedAccessToken = crypto.createHash('sha256').update(accessToken).digest('hex')
    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex')

    await this.sessionRepository.updateHashedTokens(session.uuid, hashedAccessToken, hashedRefreshToken)

    const accessTokenExpiration = dayjs.utc().add(this.accessTokenAge, 'second').toDate()
    const refreshTokenExpiration = dayjs.utc().add(this.refreshTokenAge, 'second').toDate()
    await this.sessionRepository.updatedTokenExpirationDates(session.uuid, accessTokenExpiration, refreshTokenExpiration)

    return {
      access_token: `${SessionService.SESSION_TOKEN_VERSION}:${session.uuid}:${accessToken}`,
      refresh_token: `${SessionService.SESSION_TOKEN_VERSION}:${session.uuid}:${refreshToken}`,
      access_expiration: dayjs.utc(accessTokenExpiration).valueOf(),
      refresh_expiration: dayjs.utc(refreshTokenExpiration).valueOf()
    }
  }

  isRefreshTokenValid(session: Session, token: string): boolean {
    const tokenParts = token.split(':')
    const refreshToken = tokenParts[2]
    if (!refreshToken) {
      return false
    }

    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex')

    return crypto.timingSafeEqual(Buffer.from(hashedRefreshToken), Buffer.from(session.hashedRefreshToken))
  }

  getDeviceInfo(session: Session): string {
    try {
      const userAgentParsed = this.deviceDetector.parse(session.userAgent)

      return `${userAgentParsed.client?.name} ${userAgentParsed.client?.version} on ${userAgentParsed.os?.name} ${userAgentParsed.os?.version}`
    }
    catch (error) {
      this.logger.warning(`Could not parse session device info. User agent: ${session.userAgent}: ${error.message}`)

      return session.userAgent
    }
  }

  async getSessionFromToken(token: string): Promise<Session | undefined> {
    const tokenParts = token.split(':')
    const sessionUuid = tokenParts[1]
    const accessToken = tokenParts[2]
    if (!accessToken) {
      return undefined
    }

    const session = await this.sessionRepository.findOneByUuid(sessionUuid)
    if (!session) {
      return undefined
    }

    const hashedAccessToken = crypto.createHash('sha256').update(accessToken).digest('hex')
    if(crypto.timingSafeEqual(Buffer.from(session.hashedAccessToken), Buffer.from(hashedAccessToken))) {
      return session
    }

    return undefined
  }

  async deleteSessionByToken(token: string): Promise<void> {
    const session = await this.getSessionFromToken(token)

    if (session) {
      await this.sessionRepository.deleteOneByUuid(session.uuid)
    }
  }
}
