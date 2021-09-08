import { ContentType } from '@standardnotes/common'
import { TimerInterface } from '@standardnotes/time'
import { Request } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpDelete, results } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { ContentDecoderInterface } from '../Domain/Item/ContentDecoderInterface'
import { ContentSubtype } from '../Domain/Item/ContentSubtype'
import { ItemRepositoryInterface } from '../Domain/Item/ItemRepositoryInterface'

@controller('/admin')
export class AdminController extends BaseHttpController {
  constructor(
    @inject(TYPES.ItemRepository) private itemRepository: ItemRepositoryInterface,
    @inject(TYPES.ContentDecoder) private contentDecoder: ContentDecoderInterface,
    @inject(TYPES.Timer) private timer: TimerInterface
  ) {
    super()
  }

  @httpDelete('/email-backups/:userUuid')
  public async disableEmailBackups(request: Request): Promise<results.BadRequestErrorMessageResult | results.OkResult> {
    const extensions = await this.itemRepository.findAll({
      userUuid: request.params.userUuid,
      contentType: ContentType.ServerExtension,
      deleted: false,
      sortBy: 'updated_at_timestamp',
      sortOrder: 'DESC',
    })

    const extensionsToDelete = extensions.filter(extension => {
      if (!extension.content) {
        return false
      }

      const decodedContent = this.contentDecoder.decode(extension.content)
      return decodedContent.subtype === ContentSubtype.BackupEmailArchive
    })

    if (extensionsToDelete.length === 0) {
      return this.badRequest('No email backups found')
    }

    const extensionsUuids = extensionsToDelete.map(extension => extension.uuid)
    const deletedAtTimestamp = this.timer.getTimestampInMicroseconds()
    await this.itemRepository.markItemsAsDeleted(extensionsUuids, deletedAtTimestamp)

    return this.ok()
  }
}
