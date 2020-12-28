import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { ProjectorInterface } from '../../Projection/ProjectorInterface'
import { Session } from '../Session/Session'
import { SessionServiceInterace } from '../Session/SessionServiceInterface'
import { KeyParamsFactoryInterface } from '../User/KeyParamsFactoryInterface'
import { User } from '../User/User'
import { AuthResponseFactory20190520 } from './AuthResponseFactory20190520'

@injectable()
export class AuthResponseFactory20200115 extends AuthResponseFactory20190520 {
  constructor(
    @inject(TYPES.SessionService) private sessionService: SessionServiceInterace,
    @inject(TYPES.KeyParamsFactory) private keyParamsFactory: KeyParamsFactoryInterface,
    @inject(TYPES.UserProjector) userProjector: ProjectorInterface<User>,
    @inject(TYPES.JWT_SECRET) jwtSecret: string,
    @inject(TYPES.Logger) logger: Logger
  ) {
    super(
      userProjector,
      jwtSecret,
      logger
    )
  }

  async createResponse(user: User, apiVersion: string, userAgent: string, ephemeralSession: boolean): Promise<Record<string, unknown>> {
    if (!user.supportsSessions()) {
      this.logger.debug(`User ${user.uuid} does not support sessions. Falling back to JWT auth response`)

      return super.createResponse(user)
    }

    const session = await this.createSession(user, apiVersion, userAgent, ephemeralSession)

    this.logger.debug(`Created new session for user ${user.uuid}: %O`, session)

    const sessionPayload = await this.sessionService.createTokens(session)

    this.logger.debug(`Created session payload for user ${user.uuid}: %O`, sessionPayload)

    return {
      session: sessionPayload,
      key_params: this.keyParamsFactory.create(user, true),
      user: this.userProjector.projectSimple(user)
    }
  }

  private async createSession(user: User, apiVersion: string, userAgent: string, ephemeralSession: boolean): Promise<Session> {
    if (ephemeralSession) {
      return this.sessionService.createNewEphemeralSessionForUser(user, apiVersion, userAgent)
    }

    return this.sessionService.createNewSessionForUser(user, apiVersion, userAgent)
  }
}
