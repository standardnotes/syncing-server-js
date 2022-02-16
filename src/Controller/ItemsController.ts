import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpGet, httpPost, results } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { ApiVersion } from '../Domain/Api/ApiVersion'
import { SyncResponseFactoryResolverInterface } from '../Domain/Item/SyncResponse/SyncResponseFactoryResolverInterface'
import { CheckIntegrity } from '../Domain/UseCase/CheckIntegrity/CheckIntegrity'
import { GetItem } from '../Domain/UseCase/GetItem/GetItem'
import { SyncItems } from '../Domain/UseCase/SyncItems'

@controller('/items', TYPES.AuthMiddleware)
export class ItemsController extends BaseHttpController {
  constructor(
    @inject(TYPES.SyncItems) private syncItems: SyncItems,
    @inject(TYPES.CheckIntegrity) private checkIntegrity: CheckIntegrity,
    @inject(TYPES.GetItem) private getItem: GetItem,
    @inject(TYPES.SyncResponseFactoryResolver) private syncResponseFactoryResolver: SyncResponseFactoryResolverInterface,
  ) {
    super()
  }

  @httpPost('/sync')
  public async sync(request: Request, response: Response): Promise<results.JsonResult> {
    let itemHashes = []
    if ('items' in request.body) {
      itemHashes = request.body.items
    }

    const syncResult = await this.syncItems.execute({
      userUuid: response.locals.user.uuid,
      itemHashes,
      computeIntegrityHash: request.body.compute_integrity === true,
      syncToken: request.body.sync_token,
      cursorToken: request.body.cursor_token,
      limit: request.body.limit,
      userAgent: request.headers['user-agent'],
      contentType: request.body.content_type,
      apiVersion: request.body.api ?? ApiVersion.v20161215,
    })

    const syncResponse = await this.syncResponseFactoryResolver
      .resolveSyncResponseFactoryVersion(request.body.api)
      .createResponse(syncResult)

    return this.json(syncResponse)
  }

  @httpPost('/check-integrity')
  public async checkItemsIntegrity(request: Request, response: Response): Promise<results.JsonResult> {
    let integrityHashes = []
    if ('integrityHashes' in request.body) {
      integrityHashes = request.body.integrityHashes
    }

    const result = await this.checkIntegrity.execute({
      userUuid: response.locals.user.uuid,
      integrityHashes,
    })

    return this.json(result)
  }

  @httpGet('/:uuid')
  public async getSingleItem(request: Request, response: Response): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.getItem.execute({
      userUuid: response.locals.user.uuid,
      itemUuid: request.params.uuid,
    })

    if (!result.success) {
      return this.notFound()
    }

    return this.json(result)
  }
}
