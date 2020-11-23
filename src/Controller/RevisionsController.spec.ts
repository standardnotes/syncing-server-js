import 'reflect-metadata'

import { Revision } from '../Domain/Revision/Revision'
import * as express from 'express'

import { RevisionRepositoryInterface } from '../Domain/Revision/RevisionRepositoryInterface'

import { RevisionsController } from './RevisionsController'
import { results } from 'inversify-express-utils'

describe('RevisionsController', () => {
    let revisionsRepository: RevisionRepositoryInterface
    let revision: Revision
    let request: express.Request

    const createController = () => new RevisionsController(revisionsRepository)

    beforeEach(() => {
        revisionsRepository = {} as jest.Mocked<RevisionRepositoryInterface>
        revision = {} as jest.Mocked<Revision>
        request = {
          params: {},
        } as jest.Mocked<express.Request>
    })

    it('should return revisions for an item', async () => {
        revisionsRepository.findByItemId = jest.fn().mockReturnValue([revision])

        const response = await createController().getRevisions(request)

        expect(response.json).toEqual([revision])
    })

    it('should return a specific revision for an item', async () => {
      revisionsRepository.findOneById = jest.fn().mockReturnValue(revision)

      const response = <results.JsonResult> await createController().getRevision(request)

      expect(response.json).toEqual(revision)
    })

    it('should return a 404 for a not found specific revision in an item', async () => {
      revisionsRepository.findOneById = jest.fn().mockReturnValue(undefined)

      const response = await createController().getRevision(request)

      expect(response).toBeInstanceOf(results.NotFoundResult)
    })
})
