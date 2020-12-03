import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpDelete, results } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { SessionRepositoryInterface } from '../Domain/Session/SessionRepositoryInterface'

@controller('/session', TYPES.AuthMiddleware)
export class SessionsController extends BaseHttpController {
  constructor(
    @inject(TYPES.SessionRepository) private sessionRepository: SessionRepositoryInterface,
  ) {
      super()
  }

  @httpDelete('/all')
  public async deleteAllRevisions(_request: Request, response: Response): Promise<results.JsonResult | results.StatusCodeResult> {
      if (!response.locals.user || !response.locals.session) {
        return this.json(
          {
            error: {
              message: 'No session exists with the provided identifier.',
            }
          },
          401
        )
      }

      await this.sessionRepository.deleteAllByUserUuidExceptOne(
        response.locals.user.uuid,
        response.locals.session.uuid
      )

      return this.statusCode(204)
  }
}
