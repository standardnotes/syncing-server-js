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
import { Register } from '../Domain/UseCase/Register'
import { DomainEventPublisherInterface } from '../Domain/Event/DomainEventPublisherInterface'
import { DomainEventFactoryInterface } from '../Domain/Event/DomainEventFactoryInterface'

@controller('/auth')
export class AuthController extends BaseHttpController {
  constructor(
    @inject(TYPES.SessionService) private sessionService: SessionServiceInterace,
    @inject(TYPES.VerifyMFA) private verifyMFA: VerifyMFA,
    @inject(TYPES.SignIn) private signInUseCase: SignIn,
    @inject(TYPES.GetUserKeyParams) private getUserKeyParams: GetUserKeyParams,
    @inject(TYPES.ClearLoginAttempts) private clearLoginAttempts: ClearLoginAttempts,
    @inject(TYPES.IncreaseLoginAttempts) private increaseLoginAttempts: IncreaseLoginAttempts,
    @inject(TYPES.Register) private registerUser: Register,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
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

    if (!request.query.email) {
      return this.json({
        error: {
          message: 'Please provide an email address.'
        }
      }, 400)
    }

    const verifyMFAResponse = await this.verifyMFA.execute({
      email: <string> request.query.email,
      requestParams: request.query
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

    const result = await this.getUserKeyParams.execute({
      email: <string> request.query.email
    })

    return this.json(result.keyParams)
  }

  @httpPost('/sign_in', TYPES.LockMiddleware)
  async signIn(request: Request): Promise<results.JsonResult> {
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

    const signInResult = await this.signInUseCase.execute({
      apiVersion: request.body.api,
      userAgent: <string> request.headers['user-agent'],
      email: request.body.email,
      password: request.body.password,
      ephemeralSession: request.body.ephemeral ?? false
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

  @httpPost('/')
  async register(request: Request): Promise<results.JsonResult> {
    if (!request.body.email || !request.body.password) {
      return this.json({
        error: {
          message: 'Please enter an email and a password to register.',
        }
      }, 400)
    }

    const registerResult = await this.registerUser.execute({
      email: request.body.email,
      password: request.body.password,
      updatedWithUserAgent: <string> request.headers['user-agent'],
      apiVersion: request.body.api,
      pwFunc: request.body.pw_func,
      pwAlg: request.body.pw_alg,
      pwCost: request.body.pw_cost,
      pwKeySize: request.body.pw_key_size,
      pwNonce: request.body.pw_nonce,
      pwSalt: request.body.pw_salt,
      kpOrigination: request.body.origination,
      kpCreated: request.body.created,
      version: request.body.version ? request.body.version :
        request.body.pw_nonce ? '001' : '002',
    })

    if (!registerResult.success || !registerResult.authResponse) {
      return this.json({
        error: {
          message: registerResult.errorMessage
        }
      }, 400)
    }

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createUserRegisteredEvent(
        <string> registerResult.authResponse.user.uuid,
        <string> registerResult.authResponse.user.email,
      )
    )

    return this.json(registerResult.authResponse)
  }
}
