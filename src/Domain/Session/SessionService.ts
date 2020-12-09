import * as crypto from 'crypto'
import * as winston from 'winston'
import DeviceDetector = require('device-detector-js')
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { Session } from './Session'
import { SessionRepositoryInterface } from './SessionRepositoryInterface'
import { SessionServiceInterace } from './SessionServiceInterface'

@injectable()
export class SessionService implements SessionServiceInterace {
  static readonly SESSION_TOKEN_VERSION = 1

  constructor (
    @inject(TYPES.SessionRepository) private sessionRepository: SessionRepositoryInterface,
    @inject(TYPES.DeviceDetector) private deviceDetector: DeviceDetector,
    @inject(TYPES.Logger) private logger: winston.Logger
  ) {
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
