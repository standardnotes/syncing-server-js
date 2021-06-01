import * as crypto from 'crypto'
import * as winston from 'winston'
import { UAParser } from 'ua-parser-js'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { Session } from './Session'
import { SessionRepositoryInterface } from './SessionRepositoryInterface'
import { SessionServiceInterace } from './SessionServiceInterface'
import { EphemeralSessionRepositoryInterface } from './EphemeralSessionRepositoryInterface'
import { RevokedSession } from './RevokedSession'
import { RevokedSessionRepositoryInterface } from './RevokedSessionRepositoryInterface'

@injectable()
export class SessionService implements SessionServiceInterace {
  static readonly SESSION_TOKEN_VERSION = 1

  constructor (
    @inject(TYPES.SessionRepository) private sessionRepository: SessionRepositoryInterface,
    @inject(TYPES.EphemeralSessionRepository) private ephemeralSessionRepository: EphemeralSessionRepositoryInterface,
    @inject(TYPES.RevokedSessionRepository) private revokedSessionRepository: RevokedSessionRepositoryInterface,
    @inject(TYPES.DeviceDetector) private deviceDetector: UAParser,
    @inject(TYPES.Logger) private logger: winston.Logger
  ) {
  }

  getDeviceInfo(session: Session): string {
    try {
      const userAgentParsed = this.deviceDetector.setUA(session.userAgent).getResult()

      const osInfo = `${userAgentParsed.os.name ?? ''} ${userAgentParsed.os.version ?? ''}`.trim()
      let clientInfo = `${userAgentParsed.browser.name ?? ''} ${userAgentParsed.browser.version ?? ''}`.trim()

      if (userAgentParsed.ua.toLowerCase().indexOf('okhttp') >= 0) {
        return 'Android'
      }

      const desktopAppMatches = [...userAgentParsed.ua.matchAll(/(.*)StandardNotes\/((0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*))/g)]
      if (desktopAppMatches[0] && desktopAppMatches[0][2]) {
        clientInfo = `Standard Notes Desktop ${desktopAppMatches[0][2]}`
      }

      if (osInfo && clientInfo) {
        return `${clientInfo} on ${osInfo}`
      }

      if (osInfo) {
        return osInfo
      }

      if (clientInfo) {
        return clientInfo
      }

      return 'Unknown Client on Unknown OS'
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

    const session = await this.getSession(sessionUuid)
    if (!session) {
      this.logger.debug(`Could not find session with uuid: ${sessionUuid}`)

      return undefined
    }

    const hashedAccessToken = crypto.createHash('sha256').update(accessToken).digest('hex')
    if(crypto.timingSafeEqual(Buffer.from(session.hashedAccessToken), Buffer.from(hashedAccessToken))) {
      return session
    }

    return undefined
  }

  async getRevokedSessionFromToken(token: string): Promise<RevokedSession | undefined> {
    const tokenParts = token.split(':')
    const sessionUuid = tokenParts[1]
    if (!sessionUuid) {
      return undefined
    }

    return this.revokedSessionRepository.findOneByUuid(sessionUuid)
  }

  async markRevokedSessionAsReceived(revokedSession: RevokedSession): Promise<RevokedSession> {
    revokedSession.received = true

    return this.revokedSessionRepository.save(revokedSession)
  }

  private async getSession(uuid: string): Promise<Session | undefined> {
    let session = await this.ephemeralSessionRepository.findOneByUuid(uuid)

    if (!session) {
      this.logger.debug(`Did not find an ephemeral session with uuid: ${uuid}`)

      session = await this.sessionRepository.findOneByUuid(uuid)
    }

    return session
  }
}
