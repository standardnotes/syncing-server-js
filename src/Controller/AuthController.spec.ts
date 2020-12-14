import 'reflect-metadata'

import * as express from 'express'

import { AuthController } from './AuthController'
import { results } from 'inversify-express-utils'
import { SessionServiceInterace } from '../Domain/Session/SessionServiceInterface'
import { VerifyMFA } from '../Domain/UseCase/VerifyMFA'
import { SignIn } from '../Domain/UseCase/SignIn'

describe('AuthController', () => {
    let sessionService: SessionServiceInterace
    let verifyMFA: VerifyMFA
    let signIn: SignIn
    let request: express.Request

    const createController = () => new AuthController(sessionService, verifyMFA, signIn)

    beforeEach(() => {
        sessionService = {} as jest.Mocked<SessionServiceInterace>
        sessionService.deleteSessionByToken = jest.fn()

        verifyMFA = {} as jest.Mocked<VerifyMFA>
        verifyMFA.execute = jest.fn()

        signIn = {} as jest.Mocked<SignIn>
        signIn.execute = jest.fn()

        request = {
          headers: {},
          body: {},
        } as jest.Mocked<express.Request>
    })

    it('should sign in a user', async () => {
      request.body.email = 'test@test.te'
      request.body.password = 'qwerty'

      verifyMFA.execute = jest.fn().mockReturnValue({ success: true })

      signIn.execute = jest.fn().mockReturnValue({ success: true })

      const httpResponse = <results.JsonResult> await createController().singIn(request)
      const result = await httpResponse.executeAsync()

      expect(result.statusCode).toEqual(200)
    })

    it('should not sign in a user if request param is missing', async () => {
      request.body.email = 'test@test.te'

      const httpResponse = <results.JsonResult> await createController().singIn(request)
      const result = await httpResponse.executeAsync()

      expect(result.statusCode).toEqual(401)
    })

    it('should not sign in a user if mfa verification fails', async () => {
      request.body.email = 'test@test.te'
      request.body.password = 'qwerty'

      verifyMFA.execute = jest.fn().mockReturnValue({ success: false })

      const httpResponse = <results.JsonResult> await createController().singIn(request)
      const result = await httpResponse.executeAsync()

      expect(result.statusCode).toEqual(401)
    })

    it('should not sign in a user if sign in procedure fails', async () => {
      request.body.email = 'test@test.te'
      request.body.password = 'qwerty'

      verifyMFA.execute = jest.fn().mockReturnValue({ success: true })

      signIn.execute = jest.fn().mockReturnValue({ success: false })

      const httpResponse = <results.JsonResult> await createController().singIn(request)
      const result = await httpResponse.executeAsync()

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
