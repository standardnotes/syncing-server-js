import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../../Bootstrap/Types'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { Frequency } from '../../ExtensionSetting/Frequency'
import { ContentDecoderInterface } from '../../Item/ContentDecoderInterface'
import { ContentType } from '../../Item/ContentType'
import { ItemHash } from '../../Item/ItemHash'
import { ItemRepositoryInterface } from '../../Item/ItemRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { PostToRealtimeExtensionsDTO } from './PostToRealtimeExtensionsDTO'
import { PostToRealtimeExtensionsResponse } from './PostToRealtimeExtensionsResponse'

@injectable()
export class PostToRealtimeExtensions implements UseCaseInterface {
  constructor (
    @inject(TYPES.ItemRepository) private itemRepository: ItemRepositoryInterface,
    @inject(TYPES.ContentDecoder) private contentDecoder: ContentDecoderInterface,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.Logger) private logger: Logger
  ) {
  }

  async execute(dto: PostToRealtimeExtensionsDTO): Promise<PostToRealtimeExtensionsResponse> {
    if (dto.itemHashes.length === 0) {
      return {
        success: false,
      }
    }

    const extensions = await this.itemRepository.findAll({
      contentType: ContentType.ServerExtension,
      deleted: false,
      userUuid: dto.userUuid,
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
    })

    for (const extension of extensions) {
      if (!extension.content) {
        continue
      }

      const decodedContent = this.contentDecoder.decode(extension.content)
      if (!('frequency' in decodedContent) || !('url' in decodedContent)) {
        continue
      }

      if (decodedContent.frequency === Frequency.Realtime) {
        this.logger.debug(`Publishing ITEMS_SYNCED event with ${dto.itemHashes.length} items for extension ${extension.uuid} and user ${dto.userUuid}`)

        await this.domainEventPublisher.publish(
          this.domainEventFactory.createItemsSyncedEvent({
            userUuid: dto.userUuid,
            extensionUrl: <string> decodedContent.url,
            extensionId: extension.uuid,
            itemUuids: dto.itemHashes.map((itemHash: ItemHash) => itemHash.uuid),
            forceMute: true,
            skipFileBackup: true,
          })
        )
      }
    }

    return {
      success: true,
    }
  }
}
