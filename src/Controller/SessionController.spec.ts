import 'reflect-metadata'

import * as express from 'express'

import { SessionController } from './SessionController'
import { results } from 'inversify-express-utils'
import { SessionRepositoryInterface } from '../Domain/Session/SessionRepositoryInterface'
import { Session } from '../Domain/Session/Session'

describe('SessionController', () => {
    let sessionsRepository: SessionRepositoryInterface
    let session: Session
    let request: express.Request
    let response: express.Response

    const createController = () => new SessionController(sessionsRepository)

    beforeEach(() => {
        session = {} as jest.Mocked<Session>

        sessionsRepository = {} as jest.Mocked<SessionRepositoryInterface>
        sessionsRepository.deleteAllByUserUuidExceptOne = jest.fn()
        sessionsRepository.deleteOneByUuid = jest.fn()
        sessionsRepository.findOneByUuidAndUserUuid = jest.fn().mockReturnValue(session)

        request = {
          params: {},
        } as jest.Mocked<express.Request>

        response = {
          locals: {}
        } as jest.Mocked<express.Response>
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
      request.params.uuid = '123'

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
      request.params.uuid = '234'

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
      request.params.uuid = '123'

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

        expect(sessionsRepository.deleteAllByUserUuidExceptOne).toHaveBeenCalledWith('123', '234')

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

  it('should return unauthorized if current session is missing', async () => {
    response.locals = {
      user: {
        uuid: '123',
      },
    }
    const httpResponse = <results.JsonResult> await createController().deleteAllSessions(request, response)

    expect(httpResponse.json).toEqual({ error: { message: 'No session exists with the provided identifier.' } })
    expect(httpResponse.statusCode).toEqual(401)
  })
})
