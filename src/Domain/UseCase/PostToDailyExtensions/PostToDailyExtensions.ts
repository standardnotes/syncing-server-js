import { DomainEventInterface, DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../../Bootstrap/Types'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { Frequency } from '../../ExtensionSetting/Frequency'
import { ContentDecoderInterface } from '../../Item/ContentDecoderInterface'
import { ContentSubtype } from '../../Item/ContentSubtype'
import { ContentType } from '../../Item/ContentType'
import { Item } from '../../Item/Item'
import { UseCaseInterface } from '../UseCaseInterface'
import { PostToDailyExtensionsDTO } from './PostToDailyExtensionsDTO'
import { PostToDailyExtensionsResponse } from './PostToDailyExtensionsResponse'

@injectable()
export class PostToDailyExtensions implements UseCaseInterface {
  constructor (
    @inject(TYPES.ContentDecoder) private contentDecoder: ContentDecoderInterface,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.Logger) private logger: Logger
  ) {
  }

  async execute(dto: PostToDailyExtensionsDTO): Promise<PostToDailyExtensionsResponse> {
    this.logger.debug('Posting to daily extensions...')

    const dailyExtensions = this.filterOutDailyExtensions(dto.extensions)

    for (const dailyExtension of dailyExtensions) {
      const decodedContent = this.contentDecoder.decode(<string> dailyExtension.content)

      let event: DomainEventInterface
      if ('subtype' in decodedContent && decodedContent.subtype === ContentSubtype.BackupEmailArchive) {
        this.logger.debug(`Publishing EMAIL_ARCHIVE_EXTENSION_SYNCED event for extension: ${dailyExtension.uuid}`)

        event = this.domainEventFactory.createEmailArchiveExtensionSyncedEvent(
          dto.userUuid,
          dailyExtension.uuid,
        )
      } else {
        if (!('url' in decodedContent)) {
          continue
        }

        this.logger.debug(`Publishing ITEMS_SYNCED event for extension: ${dailyExtension.uuid}`)

        event = this.domainEventFactory.createItemsSyncedEvent({
          userUuid: dto.userUuid,
          extensionUrl: <string> decodedContent.url,
          extensionId: dailyExtension.uuid,
          itemUuids: [],
          forceMute: false,
        })
      }

      await this.domainEventPublisher.publish(event)
    }

    return {
      success: true,
    }
  }

  private filterOutDailyExtensions(items: Array<Item>): Array<Item> {
    const dailyExtensions = []

    for (const item of items) {
      if (item.contentType !== ContentType.ServerExtension || item.deleted) {
        continue
      }

      const decodedContent = this.contentDecoder.decode(<string> item.content)
      if ('frequency' in decodedContent && decodedContent.frequency === Frequency.Daily) {
        dailyExtensions.push(item)
      }
    }

    return dailyExtensions
  }
}
