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
        } as jest.Mocked<express.Request>
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
