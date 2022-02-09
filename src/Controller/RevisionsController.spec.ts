import 'reflect-metadata'

import { Revision } from '../Domain/Revision/Revision'
import * as express from 'express'

import { RevisionsController } from './RevisionsController'
import { results } from 'inversify-express-utils'
import { ProjectorInterface } from '../Projection/ProjectorInterface'
import { RevisionServiceInterface } from '../Domain/Revision/RevisionServiceInterface'

describe('RevisionsController', () => {
  let revisionProjector: ProjectorInterface<Revision>
  let revisionService: RevisionServiceInterface
  let revision: Revision
  let request: express.Request
  let response: express.Response

  const createController = () => new RevisionsController(revisionService, revisionProjector)

  beforeEach(() => {
    revision = {} as jest.Mocked<Revision>

    revisionProjector = {} as jest.Mocked<ProjectorInterface<Revision>>

    revisionService = {} as jest.Mocked<RevisionServiceInterface>
    revisionService.getRevisions = jest.fn().mockReturnValue([ revision ])
    revisionService.getRevision = jest.fn().mockReturnValue(revision)

    request = {
      params: {},
    } as jest.Mocked<express.Request>

    response = {
      locals: {},
    } as jest.Mocked<express.Response>
    response.locals.user = {
      uuid: '123',
    }
    response.locals.roleNames = [ 'BASIC_USER' ]
  })

  it('should return revisions for an item', async () => {
    revisionProjector.projectSimple = jest.fn().mockReturnValue({ foo: 'bar' })

    const revisionResponse = await createController().getRevisions(request, response)

    expect(revisionResponse.json).toEqual([{ foo: 'bar' }])
  })

  it('should return a specific revision for an item', async () => {
    revisionProjector.projectFull = jest.fn().mockReturnValue({ foo: 'bar' })

    const httpResponse = <results.JsonResult> await createController().getRevision(request, response)

    expect(httpResponse.json).toEqual({ foo: 'bar' })
  })

  it('should return a 404 for a not found specific revision in an item', async () => {
    revisionService.getRevision = jest.fn().mockReturnValue(undefined)

    const httpResponse = await createController().getRevision(request, response)

    expect(httpResponse).toBeInstanceOf(results.NotFoundResult)
  })
})
