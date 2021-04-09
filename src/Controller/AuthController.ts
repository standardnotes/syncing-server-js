import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpGet, httpPost, results } from 'inversify-express-utils'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'

import TYPES from '../Bootstrap/Types'
import { SessionServiceInterace } from '../Domain/Session/SessionServiceInterface'
import { SignIn } from '../Domain/UseCase/SignIn'
import { ClearLoginAttempts } from '../Domain/UseCase/ClearLoginAttempts'
import { VerifyMFA } from '../Domain/UseCase/VerifyMFA'
import { IncreaseLoginAttempts } from '../Domain/UseCase/IncreaseLoginAttempts'
import { Logger } from 'winston'
import { Register } from '../Domain/UseCase/Register'
import { ChangePassword } from '../Domain/UseCase/ChangePassword'
import { AuthHttpServiceInterface } from '../Domain/Auth/AuthHttpServiceInterface'
import { DomainEventFactoryInterface } from '../Domain/Event/DomainEventFactoryInterface'

@controller('/auth')
export class AuthController extends BaseHttpController {
  constructor(
    @inject(TYPES.SessionService) private sessionService: SessionServiceInterace,
    @inject(TYPES.VerifyMFA) private verifyMFA: VerifyMFA,
    @inject(TYPES.SignIn) private signInUseCase: SignIn,
    @inject(TYPES.AuthHttpService) private authHttpService: AuthHttpServiceInterface,
    @inject(TYPES.ClearLoginAttempts) private clearLoginAttempts: ClearLoginAttempts,
    @inject(TYPES.IncreaseLoginAttempts) private increaseLoginAttempts: IncreaseLoginAttempts,
    @inject(TYPES.Register) private registerUser: Register,
    @inject(TYPES.ChangePassword) private changePasswordUseCase: ChangePassword,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.Logger) private logger: Logger
  ) {
    super()
  }

  @httpGet('/params', TYPES.AuthMiddlewareWithoutResponse)
  async params(request: Request, response: Response): Promise<results.JsonResult> {
    if (response.locals.session) {
      const keyParams = await this.authHttpService.getUserKeyParams(
        response.locals.user.email,
        true
      )

      return this.json(keyParams)
    }

    if (!request.query.email) {
      return this.json({
        error: {
          message: 'Please provide an email address.',
        },
      }, 400)
    }

    const verifyMFAResponse = await this.verifyMFA.execute({
      email: <string> request.query.email,
      requestParams: request.query,
    })

    if (!verifyMFAResponse.success) {
      return this.json({
        error: {
          tag: verifyMFAResponse.errorTag,
          message: verifyMFAResponse.errorMessage,
          payload: verifyMFAResponse.errorPayload,
        },
      }, 401)
    }

    const keyParams = await this.authHttpService.getUserKeyParams(<string> request.query.email, false)

    return this.json(keyParams)
  }

  @httpPost('/sign_in', TYPES.LockMiddleware)
  async signIn(request: Request): Promise<results.JsonResult> {
    if (!request.body.email || !request.body.password) {
      this.logger.debug('/auth/sign_in request missing credentials: %O', request.body)

      return this.json({
        error: {
          tag: 'invalid-auth',
          message: 'Invalid login credentials.',
        },
      }, 401)
    }

    const verifyMFAResponse = await this.verifyMFA.execute({
      email: request.body.email,
      requestParams: request.body,
    })

    if (!verifyMFAResponse.success) {
      return this.json({
        error: {
          tag: verifyMFAResponse.errorTag,
          message: verifyMFAResponse.errorMessage,
          payload: verifyMFAResponse.errorPayload,
        },
      }, 401)
    }

    const signInResult = await this.signInUseCase.execute({
      apiVersion: request.body.api,
      userAgent: <string> request.headers['user-agent'],
      email: request.body.email,
      password: request.body.password,
      ephemeralSession: request.body.ephemeral ?? false,
    })

    if (!signInResult.success) {
      await this.increaseLoginAttempts.execute({ email: request.body.email })

      return this.json({
        error: {
          message: signInResult.errorMessage,
        },
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

  @httpPost('/change_pw', TYPES.AuthMiddleware)
  async changePassword(request: Request, response: Response): Promise<results.JsonResult> {
    if (!request.body.current_password) {
      return this.json({
        error: {
          message: 'Your current password is required to change your password. Please update your application if you do not see this option.',
        },
      }, 400)
    }

    if (!request.body.new_password) {
      return this.json({
        error: {
          message: 'Your new password is required to change your password. Please try again.',
        },
      }, 400)
    }

    if (!request.body.pw_nonce) {
      return this.json({
        error: {
          message: 'The change password request is missing new auth parameters. Please try again.',
        },
      }, 400)
    }

    const changePasswordResult = await this.changePasswordUseCase.execute({
      user: response.locals.user,
      apiVersion: request.body.api,
      currentPassword: request.body.current_password,
      newPassword: request.body.new_password,
      pwNonce: request.body.pw_nonce,
      updatedWithUserAgent: <string> request.headers['user-agent'],
      protocolVersion: request.body.version,
    })

    if (!changePasswordResult.success) {
      await this.increaseLoginAttempts.execute({ email: response.locals.user.email })

      return this.json({
        error: {
          message: changePasswordResult.errorMessage,
        },
      }, 401)
    }

    await this.clearLoginAttempts.execute({ email: response.locals.user.email })

    return this.json(changePasswordResult.authResponse)
  }

  @httpPost('/')
  async register(request: Request): Promise<results.JsonResult> {
    if (!request.body.email || !request.body.password) {
      return this.json({
        error: {
          message: 'Please enter an email and a password to register.',
        },
      }, 400)
    }

    const registerResult = await this.registerUser.execute({
      email: request.body.email,
      password: request.body.password,
      updatedWithUserAgent: <string> request.headers['user-agent'],
      apiVersion: request.body.api,
      ephemeralSession: request.body.ephemeral ?? false,
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
          message: registerResult.errorMessage,
        },
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
