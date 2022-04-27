import { Request, Response } from 'express'
import { BaseHttpController, controller, httpDelete, httpGet, results } from 'inversify-express-utils'
import { inject } from 'inversify'

import TYPES from '../Bootstrap/Types'
import { ProjectorInterface } from '../Projection/ProjectorInterface'
import { Revision } from '../Domain/Revision/Revision'
import { RevisionServiceInterface } from '../Domain/Revision/RevisionServiceInterface'
import { ErrorTag } from '@standardnotes/common'
import { RevisionProjection } from '../Projection/RevisionProjection'

@controller('/items/:itemUuid/revisions', TYPES.AuthMiddleware)
export class RevisionsController extends BaseHttpController {
  constructor(
    @inject(TYPES.RevisionService) private revisionService: RevisionServiceInterface,
    @inject(TYPES.RevisionProjector) private revisionProjector: ProjectorInterface<Revision, RevisionProjection>
  ) {
    super()
  }

  @httpGet('/')
  public async getRevisions(req: Request, response: Response): Promise<results.JsonResult> {
    const revisions = await this.revisionService.getRevisions(response.locals.user.uuid, req.params.itemUuid)

    const revisionProjections = []
    for (const revision of revisions) {
      revisionProjections.push(await this.revisionProjector.projectSimple(revision))
    }

    return this.json(revisionProjections)
  }

  @httpGet('/:uuid')
  public async getRevision(request: Request, response: Response): Promise<results.JsonResult | results.NotFoundResult> {
    const revision = await this.revisionService.getRevision({
      userRoles: response.locals.roleNames,
      userUuid: response.locals.user.uuid,
      itemUuid: request.params.itemUuid,
      revisionUuid: request.params.uuid,
    })

    if (!revision) {
      return this.notFound()
    }

    const revisionProjection = await this.revisionProjector.projectFull(revision)

    return this.json(revisionProjection)
  }

  @httpDelete('/:uuid')
  public async deleteRevision(request: Request, response: Response): Promise<results.BadRequestResult | results.OkResult | results.JsonResult> {
    if (response.locals.readOnlyAccess) {
      return this.json({
        error: {
          tag: ErrorTag.ReadOnlyAccess,
          message: 'Session has read-only access.',
        },
      }, 401)
    }

    const success = await this.revisionService.removeRevision({
      userUuid: response.locals.user.uuid,
      itemUuid: request.params.itemUuid,
      revisionUuid: request.params.uuid,
    })

    if (!success) {
      return this.badRequest()
    }

    return this.ok()
  }
}
