import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpDelete, results } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { SessionRepositoryInterface } from '../Domain/Session/SessionRepositoryInterface'

@controller('/session', TYPES.AuthMiddleware)
export class SessionController extends BaseHttpController {
  constructor(
    @inject(TYPES.SessionRepository) private sessionRepository: SessionRepositoryInterface,
  ) {
      super()
  }

  @httpDelete('/')
  async deleteSession(request: Request, response: Response): Promise<results.JsonResult | results.StatusCodeResult> {
    if (!request.params.uuid) {
      return this.json({
        error: {
          message: 'Please provide the session identifier.'
        }
      }, 400)
    }

    if(request.params.uuid === response.locals.session.uuid) {
      return this.json({
        error: {
          message: 'You can not delete your current session.'
        }
      }, 400)
    }

    const session = await this.sessionRepository.findOneByUuidAndUserUuid(request.params.uuid, response.locals.user.uuid)
    if (!session) {
      return this.json({
        error: {
          message: 'No session exists with the provided identifier.'
        }
      }, 400)
    }

    await this.sessionRepository.deleteOneByUuid(request.params.uuid)

    return this.statusCode(204)
  }

  @httpDelete('/all')
  async deleteAllSessions(_request: Request, response: Response): Promise<results.JsonResult | results.StatusCodeResult> {
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
