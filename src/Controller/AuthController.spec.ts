import 'reflect-metadata'

import * as express from 'express'

import { AuthController } from './AuthController'
import { results } from 'inversify-express-utils'
import { SessionServiceInterace } from '../Domain/Session/SessionServiceInterface'
import { VerifyMFA } from '../Domain/UseCase/VerifyMFA'
import { SignIn } from '../Domain/UseCase/SignIn'
import { ClearLoginAttempts } from '../Domain/UseCase/ClearLoginAttempts'
import { IncreaseLoginAttempts } from '../Domain/UseCase/IncreaseLoginAttempts'
import { Logger } from 'winston'
import { GetUserKeyParams } from '../Domain/UseCase/GetUserKeyParams'
import { User } from '../Domain/User/User'
import { Session } from '../Domain/Session/Session'
import { UpdateUser } from '../Domain/UseCase/UpdateUser'

describe('AuthController', () => {
    let sessionService: SessionServiceInterace
    let verifyMFA: VerifyMFA
    let signIn: SignIn
    let getUserKeyParams: GetUserKeyParams
    let clearLoginAttempts: ClearLoginAttempts
    let increaseLoginAttempts: IncreaseLoginAttempts
    let updateUser: UpdateUser
    let request: express.Request
    let response: express.Response
    let user: User
    let session: Session
    let logger: Logger

    const createController = () => new AuthController(
      sessionService,
      verifyMFA,
      signIn,
      getUserKeyParams,
      clearLoginAttempts,
      increaseLoginAttempts,
      updateUser,
      logger
    )

    beforeEach(() => {
      logger = {} as jest.Mocked<Logger>
      logger.debug = jest.fn()

      sessionService = {} as jest.Mocked<SessionServiceInterace>
      sessionService.deleteSessionByToken = jest.fn()

      verifyMFA = {} as jest.Mocked<VerifyMFA>
      verifyMFA.execute = jest.fn()

      signIn = {} as jest.Mocked<SignIn>
      signIn.execute = jest.fn()

      updateUser = {} as jest.Mocked<UpdateUser>
      updateUser.execute = jest.fn()

      user = {} as jest.Mocked<User>
      user.email = 'test@test.te'

      session = {} as jest.Mocked<Session>

      getUserKeyParams = {} as jest.Mocked<GetUserKeyParams>
      getUserKeyParams.execute = jest.fn()

      clearLoginAttempts = {} as jest.Mocked<ClearLoginAttempts>
      clearLoginAttempts.execute = jest.fn()

      increaseLoginAttempts = {} as jest.Mocked<IncreaseLoginAttempts>
      increaseLoginAttempts.execute = jest.fn()

      request = {
        headers: {},
        body: {},
        query: {}
      } as jest.Mocked<express.Request>

      response = {
        locals: {}
      } as jest.Mocked<express.Response>
    })

    it('should update user', async () => {
      request.body.version = '002'
      request.body.api = '20190520'
      request.body.origination = 'test'
      request.headers['user-agent'] = 'Google Chrome'

      updateUser.execute = jest.fn().mockReturnValue({ authResponse: { foo: 'bar' } })

      const httpResponse = <results.JsonResult> await createController().update(request, response)
      const result = await httpResponse.executeAsync()

      expect(updateUser.execute).toHaveBeenCalledWith({
        apiVersion: '20190520',
        kpOrigination: 'test',
        updatedWithUserAgent: 'Google Chrome',
        version: '002',
      })

      expect(result.statusCode).toEqual(200)
      expect(await result.content.readAsStringAsync()).toEqual('{"foo":"bar"}')
    })

    it('should get auth params for an authenticated user', async () => {
      response.locals.user = user
      response.locals.session = session

      getUserKeyParams.execute = jest.fn().mockReturnValue({
        keyParams: {
          foo: 'bar'
        }
      })

      const httpResponse = <results.JsonResult> await createController().params(request, response)
      const result = await httpResponse.executeAsync()

      expect(getUserKeyParams.execute).toHaveBeenCalledWith({
        authenticatedUser: {
          email: 'test@test.te'
        },
        email: 'test@test.te'
      })

      expect(result.statusCode).toEqual(200)
      expect(await result.content.readAsStringAsync()).toEqual('{"foo":"bar"}')
    })

    it('should get auth params for unauthenticated user', async () => {
      getUserKeyParams.execute = jest.fn().mockReturnValue({
        keyParams: {
          foo: 'bar'
        }
      })

      verifyMFA.execute = jest.fn().mockReturnValue({ success: true })

      request.query.email = 'test2@test.te'

      const httpResponse = <results.JsonResult> await createController().params(request, response)
      const result = await httpResponse.executeAsync()

      expect(getUserKeyParams.execute).toHaveBeenCalledWith({
        email: 'test2@test.te'
      })

      expect(result.statusCode).toEqual(200)
      expect(await result.content.readAsStringAsync()).toEqual('{"foo":"bar"}')
    })

    it('should not get auth params for invalid MFA authentication', async () => {
      getUserKeyParams.execute = jest.fn().mockReturnValue({
        keyParams: {
          foo: 'bar'
        }
      })

      request.query.email = 'test2@test.te'

      verifyMFA.execute = jest.fn().mockReturnValue({ success: false })

      const httpResponse = <results.JsonResult> await createController().params(request, response)
      const result = await httpResponse.executeAsync()

      expect(result.statusCode).toEqual(401)
    })

    it('should not get auth params for missing email parameter', async () => {
      getUserKeyParams.execute = jest.fn().mockReturnValue({
        keyParams: {
          foo: 'bar'
        }
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
