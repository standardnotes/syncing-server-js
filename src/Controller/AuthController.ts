import { Request } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpPost, results } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { SessionServiceInterace } from '../Domain/Session/SessionServiceInterface'
import { SignIn } from '../Domain/UseCase/SignIn'
import { UnlockUser } from '../Domain/UseCase/UnlockUser'
import { VerifyMFA } from '../Domain/UseCase/VerifyMFA'

@controller('/auth')
export class AuthController extends BaseHttpController {
  constructor(
    @inject(TYPES.SessionService) private sessionService: SessionServiceInterace,
    @inject(TYPES.VerifyMFA) private verifyMFA: VerifyMFA,
    @inject(TYPES.SignIn) private signIn: SignIn,
    @inject(TYPES.UnlockUser) private unlockUser: UnlockUser
  ) {
    super()
  }

  @httpPost('/sign_in')
  async singIn(request: Request): Promise<results.JsonResult> {
    if (!request.body.email || !request.body.password) {
      return this.json({
        error: {
          tag: 'invalid-auth',
          message: 'Invalid login credentials.',
        }
      }, 401)
    }

    const verifyMFAResponse = await this.verifyMFA.execute({
      email: request.body.email,
      requestParams: request.body
    })

    if (!verifyMFAResponse.success) {
      return this.json({
        error: {
          tag: verifyMFAResponse.errorTag,
          message: verifyMFAResponse.errorMessage,
          payload: verifyMFAResponse.errorPayload,
        }
      }, 401)
    }

    const signInResult = await this.signIn.execute({
      apiVersion: request.body.api,
      userAgent: request.body.user_agent,
      email: request.body.email,
      password: request.body.password
    })

    if (!signInResult.success) {
      return this.json({
        error: {
          message: signInResult.errorMessage
        }
      }, 401)
    }

    await this.unlockUser.execute({ email: request.body.email })

    return this.json(signInResult.authResponse)
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
