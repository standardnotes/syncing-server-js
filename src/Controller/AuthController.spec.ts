import 'reflect-metadata'

import * as express from 'express'

import { DomainEventInterface, DomainEventPublisherInterface } from '@standardnotes/domain-events'

import { AuthController } from './AuthController'
import { results } from 'inversify-express-utils'
import { SessionServiceInterace } from '../Domain/Session/SessionServiceInterface'
import { VerifyMFA } from '../Domain/UseCase/VerifyMFA'
import { SignIn } from '../Domain/UseCase/SignIn'
import { ClearLoginAttempts } from '../Domain/UseCase/ClearLoginAttempts'
import { IncreaseLoginAttempts } from '../Domain/UseCase/IncreaseLoginAttempts'
import { Logger } from 'winston'
import { User } from '../Domain/User/User'
import { Session } from '../Domain/Session/Session'
import { ChangePassword } from '../Domain/UseCase/ChangePassword'
import { AuthHttpServiceInterface } from '../Domain/Auth/AuthHttpServiceInterface'
import { DomainEventFactoryInterface } from '../Domain/Event/DomainEventFactoryInterface'

describe('AuthController', () => {
  let sessionService: SessionServiceInterace
  let verifyMFA: VerifyMFA
  let signIn: SignIn
  let authHttpService: AuthHttpServiceInterface
  let clearLoginAttempts: ClearLoginAttempts
  let increaseLoginAttempts: IncreaseLoginAttempts
  let changePassword: ChangePassword
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  let event: DomainEventInterface
  let request: express.Request
  let response: express.Response
  let user: User
  let session: Session
  let logger: Logger

  const createController = () => new AuthController(
    sessionService,
    verifyMFA,
    signIn,
    authHttpService,
    clearLoginAttempts,
    increaseLoginAttempts,
    changePassword,
    logger
  )

  beforeEach(() => {
    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.warn = jest.fn()

    sessionService = {} as jest.Mocked<SessionServiceInterace>
    sessionService.deleteSessionByToken = jest.fn()

    verifyMFA = {} as jest.Mocked<VerifyMFA>
    verifyMFA.execute = jest.fn()

    signIn = {} as jest.Mocked<SignIn>
    signIn.execute = jest.fn()

    changePassword = {} as jest.Mocked<ChangePassword>
    changePassword.execute = jest.fn()

    user = {} as jest.Mocked<User>
    user.email = 'test@test.te'

    session = {} as jest.Mocked<Session>

    authHttpService = {} as jest.Mocked<AuthHttpServiceInterface>
    authHttpService.getUserKeyParams = jest.fn()

    clearLoginAttempts = {} as jest.Mocked<ClearLoginAttempts>
    clearLoginAttempts.execute = jest.fn()

    increaseLoginAttempts = {} as jest.Mocked<IncreaseLoginAttempts>
    increaseLoginAttempts.execute = jest.fn()

    event = {} as jest.Mocked<DomainEventInterface>

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createUserRegisteredEvent = jest.fn().mockReturnValue(event)

    request = {
      headers: {},
      body: {},
      query: {},
    } as jest.Mocked<express.Request>

    response = {
      locals: {},
    } as jest.Mocked<express.Response>
  })

  it('should change a password', async () => {
    request.body.version = '004'
    request.body.api = '20190520'
    request.body.current_password = 'test123'
    request.body.new_password = 'test234'
    request.body.pw_nonce = 'asdzxc'
    request.headers['user-agent'] = 'Google Chrome'
    response.locals.user = user

    changePassword.execute = jest.fn().mockReturnValue({ success: true, authResponse: { foo: 'bar' } })

    const httpResponse = <results.JsonResult> await createController().changePassword(request, response)
    const result = await httpResponse.executeAsync()

    expect(changePassword.execute).toHaveBeenCalledWith({
      apiVersion: '20190520',
      updatedWithUserAgent: 'Google Chrome',
      currentPassword: 'test123',
      newPassword: 'test234',
      pwNonce: 'asdzxc',
      protocolVersion: '004',
      user: {
        email: 'test@test.te',
      },
    })

    expect(clearLoginAttempts.execute).toHaveBeenCalled()

    expect(result.statusCode).toEqual(200)
    expect(await result.content.readAsStringAsync()).toEqual('{"foo":"bar"}')
  })

  it('should indicate if changing a password fails', async () => {
    request.body.version = '004'
    request.body.api = '20190520'
    request.body.current_password = 'test123'
    request.body.new_password = 'test234'
    request.body.pw_nonce = 'asdzxc'
    request.headers['user-agent'] = 'Google Chrome'
    response.locals.user = user

    changePassword.execute = jest.fn().mockReturnValue({ success: false, errorMessage: 'Something bad happened' })

    const httpResponse = <results.JsonResult> await createController().changePassword(request, response)
    const result = await httpResponse.executeAsync()

    expect(increaseLoginAttempts.execute).toHaveBeenCalled()

    expect(result.statusCode).toEqual(401)
    expect(await result.content.readAsStringAsync()).toEqual('{"error":{"message":"Something bad happened"}}')
  })

  it('should not change a password if current password is missing', async () => {
    request.body.version = '004'
    request.body.api = '20190520'
    request.body.new_password = 'test234'
    request.body.pw_nonce = 'asdzxc'
    request.headers['user-agent'] = 'Google Chrome'
    response.locals.user = user

    const httpResponse = <results.JsonResult> await createController().changePassword(request, response)
    const result = await httpResponse.executeAsync()

    expect(changePassword.execute).not.toHaveBeenCalled()

    expect(result.statusCode).toEqual(400)
    expect(await result.content.readAsStringAsync()).toEqual('{"error":{"message":"Your current password is required to change your password. Please update your application if you do not see this option."}}')
  })

  it('should not change a password if new password is missing', async () => {
    request.body.version = '004'
    request.body.api = '20190520'
    request.body.current_password = 'test123'
    request.body.pw_nonce = 'asdzxc'
    request.headers['user-agent'] = 'Google Chrome'
    response.locals.user = user

    const httpResponse = <results.JsonResult> await createController().changePassword(request, response)
    const result = await httpResponse.executeAsync()

    expect(changePassword.execute).not.toHaveBeenCalled()

    expect(result.statusCode).toEqual(400)
    expect(await result.content.readAsStringAsync()).toEqual('{"error":{"message":"Your new password is required to change your password. Please try again."}}')
  })

  it('should not change a password if password nonce is missing', async () => {
    request.body.version = '004'
    request.body.api = '20190520'
    request.body.current_password = 'test123'
    request.body.new_password = 'test234'
    request.headers['user-agent'] = 'Google Chrome'
    response.locals.user = user

    const httpResponse = <results.JsonResult> await createController().changePassword(request, response)
    const result = await httpResponse.executeAsync()

    expect(changePassword.execute).not.toHaveBeenCalled()

    expect(result.statusCode).toEqual(400)
    expect(await result.content.readAsStringAsync()).toEqual('{"error":{"message":"The change password request is missing new auth parameters. Please try again."}}')
  })

  it('should get auth params for an authenticated user', async () => {
    response.locals.user = user
    response.locals.session = session

    authHttpService.getUserKeyParams = jest.fn().mockReturnValue({
      foo: 'bar',
    })

    const httpResponse = <results.JsonResult> await createController().params(request, response)
    const result = await httpResponse.executeAsync()

    expect(authHttpService.getUserKeyParams).toHaveBeenCalledWith({
      email: 'test@test.te',
      authenticated: true,
    })

    expect(result.statusCode).toEqual(200)
    expect(await result.content.readAsStringAsync()).toEqual('{"foo":"bar"}')
  })

  it('should get auth params for unauthenticated user', async () => {
    authHttpService.getUserKeyParams = jest.fn().mockReturnValue({
      foo: 'bar',
    })

    verifyMFA.execute = jest.fn().mockReturnValue({ success: true })

    request.query.email = 'test2@test.te'

    const httpResponse = <results.JsonResult> await createController().params(request, response)
    const result = await httpResponse.executeAsync()

    expect(authHttpService.getUserKeyParams).toHaveBeenCalledWith({
      email: 'test2@test.te',
      authenticated: false,
    })

    expect(result.statusCode).toEqual(200)
    expect(await result.content.readAsStringAsync()).toEqual('{"foo":"bar"}')
  })

  it('should not get auth params for invalid MFA authentication', async () => {
    authHttpService.getUserKeyParams = jest.fn().mockReturnValue({
      foo: 'bar',
    })

    request.query.email = 'test2@test.te'

    verifyMFA.execute = jest.fn().mockReturnValue({ success: false })

    const httpResponse = <results.JsonResult> await createController().params(request, response)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(401)
  })

  it('should not get auth params for authenticated user if auth http service not responding', async () => {
    response.locals.user = user
    response.locals.session = session

    authHttpService.getUserKeyParams = jest.fn().mockImplementation(() => {
      throw new Error('Oops!')
    })

    const httpResponse = <results.JsonResult> await createController().params(request, response)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(400)
  })

  it('should not get auth params for unauthenticated user if auth http service not responding', async () => {
    authHttpService.getUserKeyParams = jest.fn().mockImplementation(() => {
      throw new Error('Oops!')
    })

    verifyMFA.execute = jest.fn().mockReturnValue({ success: true })

    request.query.email = 'test2@test.te'

    const httpResponse = <results.JsonResult> await createController().params(request, response)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(400)
  })

  it('should not get auth params for missing email parameter', async () => {
    authHttpService.getUserKeyParams = jest.fn().mockReturnValue({
      foo: 'bar',
    })

    verifyMFA.execute = jest.fn().mockReturnValue({ success: true })

    const httpResponse = <results.JsonResult> await createController().params(request, response)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(400)
  })

  it('should sign in a user', async () => {
    request.body.api = '20200115'
    request.headers['user-agent'] = 'Google Chrome'
    request.body.email = 'test@test.te'
    request.body.password = 'qwerty'

    verifyMFA.execute = jest.fn().mockReturnValue({ success: true })

    signIn.execute = jest.fn().mockReturnValue({ success: true })

    const httpResponse = <results.JsonResult> await createController().signIn(request)
    const result = await httpResponse.executeAsync()

    expect(signIn.execute).toHaveBeenCalledWith({
      apiVersion: '20200115',
      email: 'test@test.te',
      ephemeralSession: false,
      password: 'qwerty',
      userAgent: 'Google Chrome',
    })

    expect(clearLoginAttempts.execute).toHaveBeenCalledWith({ email: 'test@test.te' })

    expect(result.statusCode).toEqual(200)
  })

  it('should sign in a user with an ephemeral session', async () => {
    request.body.api = '20200115'
    request.headers['user-agent'] = 'Safari'
    request.body.email = 'test@test.te'
    request.body.password = 'qwerty'
    request.body.ephemeral = true

    verifyMFA.execute = jest.fn().mockReturnValue({ success: true })

    signIn.execute = jest.fn().mockReturnValue({ success: true })

    const httpResponse = <results.JsonResult> await createController().signIn(request)
    const result = await httpResponse.executeAsync()

    expect(signIn.execute).toHaveBeenCalledWith({
      apiVersion: '20200115',
      email: 'test@test.te',
      ephemeralSession: true,
      password: 'qwerty',
      userAgent: 'Safari',
    })

    expect(clearLoginAttempts.execute).toHaveBeenCalledWith({ email: 'test@test.te' })

    expect(result.statusCode).toEqual(200)
  })

  it('should not sign in a user if request param is missing', async () => {
    request.body.email = 'test@test.te'

    const httpResponse = <results.JsonResult> await createController().signIn(request)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(401)
  })

  it('should not sign in a user if mfa verification fails', async () => {
    request.body.email = 'test@test.te'
    request.body.password = 'qwerty'

    verifyMFA.execute = jest.fn().mockReturnValue({ success: false })

    const httpResponse = <results.JsonResult> await createController().signIn(request)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(401)
  })

  it('should not sign in a user if sign in procedure fails', async () => {
    request.body.email = 'test@test.te'
    request.body.password = 'qwerty'

    verifyMFA.execute = jest.fn().mockReturnValue({ success: true })

    signIn.execute = jest.fn().mockReturnValue({ success: false })

    const httpResponse = <results.JsonResult> await createController().signIn(request)
    const result = await httpResponse.executeAsync()

    expect(increaseLoginAttempts.execute).toHaveBeenCalledWith({ email: 'test@test.te' })

    expect(result.statusCode).toEqual(401)
  })

  it('should delete a session by authorization header token', async () => {
    request.headers.authorization = 'Bearer test'

    const httpResponse = <results.StatusCodeResult> await createController().signOut(request)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(204)
  })

  it('should not delete a session if authorization header is missing', async () => {
    const httpResponse = <results.JsonResult> await createController().signOut(request)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(401)
  })
})
