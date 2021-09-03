import { ContentType } from '@standardnotes/common'
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
  ) {
    super()
  }

  @httpDelete('/email-backups/:userUuid')
  public async disableEmailBackups(request: Request): Promise<results.NotFoundResult | results.OkResult> {
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
      return this.notFound()
    }

    await Promise.all(
      extensionsToDelete.map(extension => this.itemRepository.remove(extension))
    )

    return this.ok()
  }
}
