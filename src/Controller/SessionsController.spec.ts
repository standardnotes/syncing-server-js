import 'reflect-metadata'

import * as express from 'express'

import { SessionsController } from './SessionsController'
import { results } from 'inversify-express-utils'
import { SessionRepositoryInterface } from '../Domain/Session/SessionRepositoryInterface'

describe('SessionsController', () => {
    let sessionsRepository: SessionRepositoryInterface
    let request: express.Request
    let response: express.Response

    const createController = () => new SessionsController(sessionsRepository)

    beforeEach(() => {
        sessionsRepository = {} as jest.Mocked<SessionRepositoryInterface>
        sessionsRepository.deleteAllByUserUuidExceptOne = jest.fn()

        request = {
          params: {},
        } as jest.Mocked<express.Request>

        response = {
          locals: {}
        } as jest.Mocked<express.Response>
    })

    it('should delete all revisions except current for current user', async () => {
        response.locals = {
          user: {
            uuid: '123',
          },
          session: {
            uuid: '234',
          },
        }
        const httpResponse = await createController().deleteAllRevisions(request, response)

        expect(httpResponse).toBeInstanceOf(results.StatusCodeResult)
    })

    it('should return unauthorized if current user is missing', async () => {
      response.locals = {
        session: {
          uuid: '234',
        },
      }
      const httpResponse = <results.JsonResult> await createController().deleteAllRevisions(request, response)

      expect(httpResponse.json).toEqual({ error: { message: 'No session exists with the provided identifier.' } })
      expect(httpResponse.statusCode).toEqual(401)
  })

  it('should return unauthorized if current session is missing', async () => {
    response.locals = {
      user: {
        uuid: '123',
      },
    }
    const httpResponse = <results.JsonResult> await createController().deleteAllRevisions(request, response)

    expect(httpResponse.json).toEqual({ error: { message: 'No session exists with the provided identifier.' } })
    expect(httpResponse.statusCode).toEqual(401)
})
})
