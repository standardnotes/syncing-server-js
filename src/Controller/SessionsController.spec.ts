import 'reflect-metadata'

import * as express from 'express'

import { SessionsController } from './SessionsController'
import { results } from 'inversify-express-utils'
import { SessionRepositoryInterface } from '../Domain/Session/SessionRepositoryInterface'
import { Session } from '../Domain/Session/Session'
import { ProjectorInterface } from '../Projection/ProjectorInterface'

describe('SessionsController', () => {
    let sessionsRepository: SessionRepositoryInterface
    let sessionProjector: ProjectorInterface<Session>
    let session: Session
    let request: express.Request
    let response: express.Response

    const createController = () => new SessionsController(sessionsRepository, sessionProjector)

    beforeEach(() => {
        session = {} as jest.Mocked<Session>

        sessionsRepository = {} as jest.Mocked<SessionRepositoryInterface>
        sessionsRepository.findActiveByUserUuid = jest.fn().mockReturnValue([session])

        sessionProjector = {} as jest.Mocked<ProjectorInterface<Session>>
        sessionProjector.projectCustom = jest.fn().mockReturnValue({ foo: 'bar' })

        request = {
          params: {},
        } as jest.Mocked<express.Request>

        response = {
          locals: {}
        } as jest.Mocked<express.Response>
    })

    it('should get all active sessions for current user', async () => {
      response.locals = {
        user: {
          uuid: '123',
        },
        session: {
          uuid: '234',
        },
      }

      const httpResponse = await createController().getSessions(request, response)

      expect(httpResponse).toBeInstanceOf(results.JsonResult)

      const result = await httpResponse.executeAsync()
      expect(await result.content.readAsStringAsync()).toEqual('[{"foo":"bar"}]')
    })
})
