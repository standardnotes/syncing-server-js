import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
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
  ) {
  }

  async execute(dto: PostToRealtimeExtensionsDTO): Promise<PostToRealtimeExtensionsResponse> {
    const extensions = await this.itemRepository.findAll({
      contentType: ContentType.ServerExtension,
      deleted: false,
      userUuid: dto.userUuid,
      sortBy: 'updated_at_timestamp',
      sortOrder: 'DESC',
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
        await this.domainEventPublisher.publish(
          this.domainEventFactory.createItemsSyncedEvent({
            userUuid: dto.userUuid,
            extensionUrl: <string> decodedContent.url,
            extensionId: extension.uuid,
            itemUuids: dto.itemHashes.map((itemHash: ItemHash) => itemHash.uuid),
            forceMute: true,
          })
        )
      }
    }

    return {
      success: true,
    }
  }
}
