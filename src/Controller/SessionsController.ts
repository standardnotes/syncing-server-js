import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpGet, results } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { Session } from '../Domain/Session/Session'
import { GetActiveSessionsForUser } from '../Domain/UseCase/GetActiveSessionsForUser'
import { ProjectorInterface } from '../Projection/ProjectorInterface'
import { SessionProjector } from '../Projection/SessionProjector'

@controller('/sessions', TYPES.AuthMiddleware, TYPES.SessionMiddleware)
export class SessionsController extends BaseHttpController {
  constructor(
    @inject(TYPES.GetActiveSessionsForUser) private getActiveSessionsForUser: GetActiveSessionsForUser,
    @inject(TYPES.SessionProjector) private sessionProjector: ProjectorInterface<Session>
  ) {
    super()
  }

  @httpGet('/')
  async getSessions(_request: Request, response: Response): Promise<results.JsonResult> {
    const useCaseResponse = await this.getActiveSessionsForUser.execute({
      userUuid: response.locals.user.uuid,
    })

    return this.json(
      useCaseResponse.sessions.map(
        (session) => this.sessionProjector.projectCustom(
          SessionProjector.CURRENT_SESSION_PROJECTION.toString(),
          session,
          response.locals.session
        )
      )
    )
  }
}
