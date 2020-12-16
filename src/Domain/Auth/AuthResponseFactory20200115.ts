import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { ProjectorInterface } from '../../Projection/ProjectorInterface'
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
    @inject(TYPES.JWT_SECRET) jwtSecret: string
  ) {
    super(
      userProjector,
      jwtSecret
    )
  }

  async createResponse(user: User, apiVersion: string, userAgent: string): Promise<Record<string, unknown>> {
    if (!user.supportsSessions()) {
      return super.createResponse(user)
    }

    const session = await this.sessionService.createNewSessionForUser(user, apiVersion, userAgent)

    const sessionPayload = await this.sessionService.createTokens(session)

    return {
      session: sessionPayload,
      key_params: this.keyParamsFactory.create(user),
      user: this.userProjector.projectSimple(user)
    }
  }
}
