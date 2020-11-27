import 'reflect-metadata'

import { Revision } from '../Domain/Revision/Revision'
import * as express from 'express'

import { RevisionRepositoryInterface } from '../Domain/Revision/RevisionRepositoryInterface'

import { RevisionsController } from './RevisionsController'
import { results } from 'inversify-express-utils'
import { ProjectorInterface } from '../Projection/ProjectorInterface'

describe('RevisionsController', () => {
    let revisionsRepository: RevisionRepositoryInterface
    let revisionProjector: ProjectorInterface<Revision>
    let revision: Revision
    let request: express.Request

    const createController = () => new RevisionsController(revisionsRepository, revisionProjector)

    beforeEach(() => {
        revisionsRepository = {} as jest.Mocked<RevisionRepositoryInterface>

        revision = {} as jest.Mocked<Revision>

        revisionProjector = {} as jest.Mocked<ProjectorInterface<Revision>>

        request = {
          params: {},
        } as jest.Mocked<express.Request>
    })

    it('should return revisions for an item', async () => {
        revisionsRepository.findByItemId = jest.fn().mockReturnValue([revision])
        revisionProjector.projectSimple = jest.fn().mockReturnValue({ foo: 'bar' })

        const response = await createController().getRevisions(request)

        expect(response.json).toEqual([{ foo: 'bar' }])
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
