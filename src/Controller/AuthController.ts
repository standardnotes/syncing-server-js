import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpGet, httpPost, results } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { SessionServiceInterace } from '../Domain/Session/SessionServiceInterface'
import { SignIn } from '../Domain/UseCase/SignIn'
import { ClearLoginAttempts } from '../Domain/UseCase/ClearLoginAttempts'
import { VerifyMFA } from '../Domain/UseCase/VerifyMFA'
import { IncreaseLoginAttempts } from '../Domain/UseCase/IncreaseLoginAttempts'
import { Logger } from 'winston'
import { GetUserKeyParams } from '../Domain/UseCase/GetUserKeyParams'

@controller('/auth')
export class AuthController extends BaseHttpController {
  constructor(
    @inject(TYPES.SessionService) private sessionService: SessionServiceInterace,
    @inject(TYPES.VerifyMFA) private verifyMFA: VerifyMFA,
    @inject(TYPES.SignIn) private signIn: SignIn,
    @inject(TYPES.GetUserKeyParams) private getUserKeyParams: GetUserKeyParams,
    @inject(TYPES.ClearLoginAttempts) private clearLoginAttempts: ClearLoginAttempts,
    @inject(TYPES.IncreaseLoginAttempts) private increaseLoginAttempts: IncreaseLoginAttempts,
    @inject(TYPES.Logger) private logger: Logger
  ) {
    super()
  }

  @httpGet('/params', TYPES.AuthMiddlewareWithoutResponse)
  async params(request: Request, response: Response): Promise<results.JsonResult> {
    if (response.locals.session) {
      const result = await this.getUserKeyParams.execute({
        email: response.locals.user.email,
        authenticatedUser: response.locals.user
      })

      return this.json(result.keyParams)
    }

    const verifyMFAResponse = await this.verifyMFA.execute({
      email: request.params.email,
      requestParams: request.params
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

    if (!request.params.email) {
      return this.json({
        error: {
          message: 'Please provide an email address.'
        }
      }, 400)
    }

    const result = await this.getUserKeyParams.execute({
      email: request.params.email
    })

    return this.json(result.keyParams)
  }

  @httpPost('/sign_in', TYPES.LockMiddleware)
  async singIn(request: Request): Promise<results.JsonResult> {
    if (!request.body.email || !request.body.password) {
      this.logger.debug('/auth/sign_in request missing credentials: %O', request.body)

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
      await this.increaseLoginAttempts.execute({ email: request.body.email })

      return this.json({
        error: {
          message: signInResult.errorMessage
        }
      }, 401)
    }

    await this.clearLoginAttempts.execute({ email: request.body.email })

    return this.json(signInResult.authResponse)
  }

  @httpPost('/sign_out')
  async signOut(request: Request): Promise<results.JsonResult | results.StatusCodeResult> {
    const authorizationHeader = <string> request.headers.authorization

    if (!authorizationHeader) {
      this.logger.debug('/auth/sign_out request missing authorization header')

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
