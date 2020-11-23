import * as express from 'express'
import { BaseHttpController, controller, httpGet, results } from 'inversify-express-utils'
import { RevisionRepositoryInterface } from '../Domain/Revision/RevisionRepositoryInterface'
import TYPES from '../Bootstrap/Types'
import { inject } from 'inversify'

@controller('/items/:item_id/revisions')
export class RevisionsController extends BaseHttpController {
    constructor(
      @inject(TYPES.RevisionRepository) private revisionRepository: RevisionRepositoryInterface
    ) {
        super()
    }

    @httpGet('/')
    public async getRevisions(req: express.Request): Promise<results.JsonResult> {
        const revisions = await this.revisionRepository.findByItemId(req.params.item_id)

        return this.json(revisions)
    }

    @httpGet('/:id')
    public async getRevision(req: express.Request): Promise<results.JsonResult | results.NotFoundResult> {
        const revision = await this.revisionRepository.findOneById(req.params.item_id, req.params.id)

        if (!revision) {
          return this.notFound()
        }

        return this.json(revision)
    }
}
