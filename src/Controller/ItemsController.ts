import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpPost, results } from 'inversify-express-utils'
import { Logger } from 'winston'
import TYPES from '../Bootstrap/Types'
import { ApiVersion } from '../Domain/Api/ApiVersion'
import { SyncResponseFactoryResolverInterface } from '../Domain/Item/SyncResponse/SyncResponseFactoryResolverInterface'
import { PostToDailyExtensions } from '../Domain/UseCase/PostToDailyExtensions/PostToDailyExtensions'
import { PostToRealtimeExtensions } from '../Domain/UseCase/PostToRealtimeExtensions/PostToRealtimeExtensions'
import { SyncItems } from '../Domain/UseCase/SyncItems'

@controller('/items', TYPES.AuthMiddleware)
export class ItemsController extends BaseHttpController {
  constructor(
    @inject(TYPES.SyncItems) private syncItems: SyncItems,
    @inject(TYPES.SyncResponseFactoryResolver) private syncResponseFactoryResolver: SyncResponseFactoryResolverInterface,
    @inject(TYPES.PostToRealtimeExtensions) private postToRealtimeExtensions: PostToRealtimeExtensions,
    @inject(TYPES.PostToDailyExtensions) private postToDailyExtensions: PostToDailyExtensions,
    @inject(TYPES.Logger) private logger: Logger
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

    try {
      await this.postToRealtimeExtensions.execute({
        userUuid: response.locals.user.uuid,
        itemHashes: request.body.items,
      })

      await this.postToDailyExtensions.execute({
        userUuid: response.locals.user.uuid,
        items: syncResult.savedItems,
      })

    } catch (error) {
      this.logger.error(`Failed posting items to extensions after sync: ${error.message}`)
    }

    const syncResponse = this.syncResponseFactoryResolver
      .resolveSyncResponseFactoryVersion(request.body.api)
      .createResponse(syncResult)

    return this.json(syncResponse)
  }
}
