import { Request, Response } from 'express'
import { BaseHttpController, controller, httpGet, results } from 'inversify-express-utils'
import { inject } from 'inversify'

import TYPES from '../Bootstrap/Types'
import { ProjectorInterface } from '../Projection/ProjectorInterface'
import { Revision } from '../Domain/Revision/Revision'
import { RevisionServiceInterface } from '../Domain/Revision/RevisionServiceInterface'
import { RevisionRepositoryInterface } from '../Domain/Revision/RevisionRepositoryInterface'

@controller('/items/:itemUuid/revisions', TYPES.AuthMiddleware)
export class RevisionsController extends BaseHttpController {
  constructor(
    @inject(TYPES.RevisionService) private revisionService: RevisionServiceInterface,
    @inject(TYPES.RevisionRepository) private revisionRepository: RevisionRepositoryInterface,
    @inject(TYPES.RevisionProjector) private revisionProjector: ProjectorInterface<Revision>
  ) {
    super()
  }

  @httpGet('/')
  public async getRevisions(req: Request, response: Response): Promise<results.JsonResult> {
    const revisions = await this.revisionService.getRevisions(response.locals.user.uuid, req.params.itemUuid)

    return this.json(revisions.map((revision) => this.revisionProjector.projectSimple(revision)))
  }

  @httpGet('/:uuid')
  public async getRevision(req: Request): Promise<results.JsonResult | results.NotFoundResult> {
    const revision = await this.revisionRepository.findOneById(req.params.itemUuid, req.params.uuid)

    if (!revision) {
      return this.notFound()
    }

    return this.json(this.revisionProjector.projectFull(revision))
  }
}
