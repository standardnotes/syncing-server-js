import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpPost, results } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { SyncItems } from '../Domain/UseCase/SyncItems'

@controller('/items', TYPES.AuthMiddleware)
export class ItemsController extends BaseHttpController {
  constructor(
    @inject(TYPES.ItemService) private syncItems: SyncItems
  ) {
    super()
  }

  @httpPost('/')
  public async sync(request: Request, response: Response): Promise<results.JsonResult> {
    const syncResult = await this.syncItems.execute({
      userUuid: response.locals.user.uuid,
      itemHashes: request.body.items,
      computeIntegrityHash: request.body.compute_integrity === true,
      syncToken: request.body.sync_token,
      cursorToken: request.body.cursor_token,
      limit: request.body.limit,
      userAgent: request.headers['user-agent'],
      contentType: request.body.content_type,
      apiVersion: request.body.api
    })

    return this.json(syncResult)
  }
}
