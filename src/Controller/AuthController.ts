import { Request } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpPost, results } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { SessionServiceInterace } from '../Domain/Session/SessionServiceInterface'

@controller('/auth')
export class AuthController extends BaseHttpController {
  constructor(
    @inject(TYPES.SessionService) private sessionService: SessionServiceInterace
  ) {
    super()
  }

  @httpPost('/sign_out')
  async signOut(request: Request): Promise<results.JsonResult | results.StatusCodeResult> {
    const authorizationHeader = <string> request.headers.authorization

    if (!authorizationHeader) {
        return this.json({
          error: {
            tag: 'invalid-auth',
            message: 'Invalid login credentials.',
          },
        }, 401)
    }

    await this.sessionService.deleteSessionByToken(authorizationHeader.replace('Bearer ', ''))

    return this.statusCode(204)
  }
}
