import 'reflect-metadata'

import { Revision } from '../Domain/Revision/Revision'
import * as express from 'express'

import { RevisionRepositoryInterface } from '../Domain/Revision/RevisionRepositoryInterface'

import { RevisionsController } from './RevisionsController'
import { results } from 'inversify-express-utils'
import { ProjectorInterface } from '../Projection/ProjectorInterface'
import { RevisionServiceInterface } from '../Domain/Revision/RevisionServiceInterface'

describe('RevisionsController', () => {
  let revisionsRepository: RevisionRepositoryInterface
  let revisionProjector: ProjectorInterface<Revision>
  let revisionService: RevisionServiceInterface
  let revision: Revision
  let request: express.Request
  let response: express.Response

  const createController = () => new RevisionsController(revisionService, revisionsRepository, revisionProjector)

  beforeEach(() => {
    revisionsRepository = {} as jest.Mocked<RevisionRepositoryInterface>

    revision = {} as jest.Mocked<Revision>

    revisionProjector = {} as jest.Mocked<ProjectorInterface<Revision>>

    revisionService = {} as jest.Mocked<RevisionServiceInterface>
    revisionService.getRevisions = jest.fn().mockReturnValue([ revision ])

    request = {
      params: {},
    } as jest.Mocked<express.Request>

    response = {
      locals: {},
    } as jest.Mocked<express.Response>
    response.locals.user = {
      uuid: '123',
    }
  })

  it('should return revisions for an item', async () => {
    revisionsRepository.findByItemId = jest.fn().mockReturnValue([revision])
    revisionProjector.projectSimple = jest.fn().mockReturnValue({ foo: 'bar' })

    const revisionResponse = await createController().getRevisions(request, response)

    expect(revisionResponse.json).toEqual([{ foo: 'bar' }])
  })

  it('should return a specific revision for an item', async () => {
    revisionsRepository.findOneById = jest.fn().mockReturnValue(revision)
    revisionProjector.projectFull = jest.fn().mockReturnValue({ foo: 'bar' })

    const response = <results.JsonResult> await createController().getRevision(request)

    expect(response.json).toEqual({ foo: 'bar' })
  })

  it('should return a 404 for a not found specific revision in an item', async () => {
    revisionsRepository.findOneById = jest.fn().mockReturnValue(undefined)

    const response = await createController().getRevision(request)

    expect(response).toBeInstanceOf(results.NotFoundResult)
  })
})
