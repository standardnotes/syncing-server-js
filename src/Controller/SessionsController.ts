import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpGet, results } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { Session } from '../Domain/Session/Session'
import { SessionRepositoryInterface } from '../Domain/Session/SessionRepositoryInterface'
import { ProjectorInterface } from '../Projection/ProjectorInterface'
import { SessionProjector } from '../Projection/SessionProjector'

@controller('/sessions', TYPES.AuthMiddleware)
export class SessionsController extends BaseHttpController {
  constructor(
    @inject(TYPES.SessionRepository) private sessionRepository: SessionRepositoryInterface,
    @inject(TYPES.SessionProjector) private sessionProjector: ProjectorInterface<Session>
  ) {
      super()
  }

  @httpGet('/')
  async getSessions(_request: Request, response: Response): Promise<results.JsonResult> {
    const sessions = await this.sessionRepository.findActiveByUserUuid(response.locals.user.uuid)

    return this.json(
      sessions.map(
        (session) => this.sessionProjector.projectCustom(
          SessionProjector.CURRENT_SESSION_PROJECTION.toString(),
          session,
          response.locals.session
        )
      )
    )
  }
}
