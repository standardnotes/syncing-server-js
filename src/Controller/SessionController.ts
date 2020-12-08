import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpDelete, httpPost, results } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { SessionRepositoryInterface } from '../Domain/Session/SessionRepositoryInterface'
import { RefreshSessionToken } from '../Domain/UseCase/RefreshSessionToken'

@controller('/session')
export class SessionController extends BaseHttpController {
  constructor(
    @inject(TYPES.SessionRepository) private sessionRepository: SessionRepositoryInterface,
    @inject(TYPES.RefreshSessionToken) private refreshSessionToken: RefreshSessionToken
  ) {
      super()
  }

  @httpDelete('/', TYPES.AuthMiddleware, TYPES.SessionMiddleware)
  async deleteSession(request: Request, response: Response): Promise<results.JsonResult | results.StatusCodeResult> {
    if (!request.body.uuid) {
      return this.json({
        error: {
          message: 'Please provide the session identifier.'
        }
      }, 400)
    }

    if(request.body.uuid === response.locals.session.uuid) {
      return this.json({
        error: {
          message: 'You can not delete your current session.'
        }
      }, 400)
    }

    const session = await this.sessionRepository.findOneByUuidAndUserUuid(request.body.uuid, response.locals.user.uuid)
    if (!session) {
      return this.json({
        error: {
          message: 'No session exists with the provided identifier.'
        }
      }, 400)
    }

    await this.sessionRepository.deleteOneByUuid(request.body.uuid)

    return this.statusCode(204)
  }

  @httpDelete('/all', TYPES.AuthMiddleware, TYPES.SessionMiddleware)
  async deleteAllSessions(_request: Request, response: Response): Promise<results.JsonResult | results.StatusCodeResult> {
      if (!response.locals.user) {
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

  @httpPost('/refresh')
  async refresh(request: Request, _response: Response): Promise<results.JsonResult> {
    if (!request.body.access_token || !request.body.refresh_token) {
      return this.json({
        error: {
          message: 'Please provide all required parameters.',
        },
      }, 400)
    }

    const result = await this.refreshSessionToken.execute({
      accessToken: request.body.access_token,
      refreshToken: request.body.refresh_token
    })

    if (!result.success) {
      return this.json({
        error: {
          tag: result.errorTag,
          message: result.errorMessage,
        },
      }, 400)
    }

    return this.json({
      session: result.sessionPayload
    })
  }
}
