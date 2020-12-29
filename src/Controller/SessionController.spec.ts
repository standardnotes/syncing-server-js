import 'reflect-metadata'

import * as express from 'express'

import { SessionController } from './SessionController'
import { results } from 'inversify-express-utils'
import { SessionRepositoryInterface } from '../Domain/Session/SessionRepositoryInterface'
import { Session } from '../Domain/Session/Session'
import { RefreshSessionToken } from '../Domain/UseCase/RefreshSessionToken'
import { DeletePreviousSessionsForUser } from '../Domain/UseCase/DeletePreviousSessionsForUser'

describe('SessionController', () => {
    let sessionsRepository: SessionRepositoryInterface
    let deletePreviousSessionsForUser: DeletePreviousSessionsForUser
    let refreshSessionToken: RefreshSessionToken
    let session: Session
    let request: express.Request
    let response: express.Response

    const createController = () => new SessionController(
      sessionsRepository,
      deletePreviousSessionsForUser,
      refreshSessionToken
    )

    beforeEach(() => {
        session = {} as jest.Mocked<Session>

        sessionsRepository = {} as jest.Mocked<SessionRepositoryInterface>
        sessionsRepository.deleteOneByUuid = jest.fn()
        sessionsRepository.findOneByUuidAndUserUuid = jest.fn().mockReturnValue(session)

        deletePreviousSessionsForUser = {} as jest.Mocked<DeletePreviousSessionsForUser>
        deletePreviousSessionsForUser.execute = jest.fn()

        refreshSessionToken = {} as jest.Mocked<RefreshSessionToken>
        refreshSessionToken.execute = jest.fn()

        request = {
          body: {},
        } as jest.Mocked<express.Request>

        response = {
          locals: {}
        } as jest.Mocked<express.Response>
    })

    it('should refresh session tokens', async () => {
      request.body.access_token = '123'
      request.body.refresh_token = '234'

      refreshSessionToken.execute = jest.fn().mockReturnValue({
        success: true,
        sessionPayload: {
          access_token: '1231',
          refresh_token: '2341',
          access_expiration: 123123,
          refresh_expiration: 123123
        }
      })

      const httpResponse = await createController().refresh(request, response)

      expect(httpResponse.json).toEqual({
        session: {
          access_token: '1231',
          refresh_token: '2341',
          access_expiration: 123123,
          refresh_expiration: 123123
        }
      })
      expect(httpResponse.statusCode).toEqual(200)
    })

    it('should return bad request if tokens are missing from refresh token request', async () => {
      const httpResponse = await createController().refresh(request, response)
      expect(httpResponse.statusCode).toEqual(400)
    })

    it('should return bad request upon failed tokens refreshing', async () => {
      request.body.access_token = '123'
      request.body.refresh_token = '234'

      refreshSessionToken.execute = jest.fn().mockReturnValue({
        success: false,
        errorTag: 'test',
        errorMessage: 'something bad happened'
      })

      const httpResponse = await createController().refresh(request, response)

      expect(httpResponse.json).toEqual({
        error: {
          tag: 'test',
          message: 'something bad happened'
        }
      })
      expect(httpResponse.statusCode).toEqual(400)
    })

    it('should delete a specific session for current user', async () => {
      response.locals = {
        user: {
          uuid: '123',
        },
        session: {
          uuid: '234',
        },
      }
      request.body.uuid = '123'

      const httpResponse = await createController().deleteSession(request, response)

      expect(sessionsRepository.deleteOneByUuid).toBeCalledWith('123')

      expect(httpResponse).toBeInstanceOf(results.StatusCodeResult)
    })

    it('should not delete a specific session if request is missing params', async () => {
      response.locals = {
        user: {
          uuid: '123',
        },
        session: {
          uuid: '234',
        },
      }

      const httpResponse = <results.JsonResult> await createController().deleteSession(request, response)

      expect(sessionsRepository.deleteOneByUuid).not.toHaveBeenCalled()

      expect(httpResponse.statusCode).toEqual(400)
    })

    it('should not delete a specific session if it is the current session', async () => {
      response.locals = {
        user: {
          uuid: '123',
        },
        session: {
          uuid: '234',
        },
      }
      request.body.uuid = '234'

      const httpResponse = <results.JsonResult> await createController().deleteSession(request, response)

      expect(sessionsRepository.deleteOneByUuid).not.toHaveBeenCalled()

      expect(httpResponse.statusCode).toEqual(400)
    })

    it('should not delete a specific session if it does not exist', async () => {
      response.locals = {
        user: {
          uuid: '123',
        },
        session: {
          uuid: '234',
        },
      }
      request.body.uuid = '123'

      sessionsRepository.findOneByUuidAndUserUuid = jest.fn().mockReturnValue(null)

      const httpResponse = <results.JsonResult> await createController().deleteSession(request, response)

      expect(sessionsRepository.deleteOneByUuid).not.toHaveBeenCalled()

      expect(httpResponse.statusCode).toEqual(400)
    })

    it('should delete all sessions except current for current user', async () => {
        response.locals = {
          user: {
            uuid: '123',
          },
          session: {
            uuid: '234',
          },
        }
        const httpResponse = await createController().deleteAllSessions(request, response)

        expect(deletePreviousSessionsForUser.execute).toHaveBeenCalledWith({
          userUuid: '123',
          currentSessionUuid: '234'
        })

        expect(httpResponse).toBeInstanceOf(results.StatusCodeResult)
    })

    it('should return unauthorized if current user is missing', async () => {
      response.locals = {
        session: {
          uuid: '234',
        },
      }
      const httpResponse = <results.JsonResult> await createController().deleteAllSessions(request, response)

      expect(httpResponse.json).toEqual({ error: { message: 'No session exists with the provided identifier.' } })
      expect(httpResponse.statusCode).toEqual(401)
  })
})
