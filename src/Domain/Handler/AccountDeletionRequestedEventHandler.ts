import { AccountDeletionRequestedEvent, DomainEventHandlerInterface, DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { Frequency } from '../ExtensionSetting/Frequency'
import { ContentDecoderInterface } from '../Item/ContentDecoderInterface'
import { ContentType } from '../Item/ContentType'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { RevisionServiceInterface } from '../Revision/RevisionServiceInterface'

@injectable()
export class AccountDeletionRequestedEventHandler implements DomainEventHandlerInterface {
  constructor (
    @inject(TYPES.ItemRepository) private itemRepository: ItemRepositoryInterface,
    @inject(TYPES.RevisionService) private revisionService: RevisionServiceInterface,
    @inject(TYPES.ContentDecoder) private contentDecoder: ContentDecoderInterface,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {
  }

  async handle(event: AccountDeletionRequestedEvent): Promise<void> {
    await this.syncExtensionsRemoval(event.payload.userUuid)

    await this.removeItemsAndRevisions(event.payload.userUuid)

    this.logger.info(`Finished account cleanup for user: ${event.payload.userUuid}`)
  }

  private async syncExtensionsRemoval(userUuid: string): Promise<void> {
    const extensions = await this.itemRepository.findAll({
      deleted: false,
      contentType: ContentType.ServerExtension,
      userUuid,
      sortBy: 'updated_at_timestamp',
      sortOrder: 'DESC',
    })

    for (const extension of extensions) {
      if (!extension.content) {
        continue
      }
      const decodedContent = await this.contentDecoder.decode(extension.content)

      if (!('frequency' in decodedContent) || decodedContent.frequency !== Frequency.Realtime) {
        continue
      }

      await this.domainEventPublisher.publish(
        await this.domainEventFactory.createItemsSyncedEvent({
          userUuid,
          extensionUrl: `${decodedContent.url}&directive=delete-account`,
          extensionId: extension.uuid,
          itemUuids: [],
          forceMute: true,
        })
      )
    }
  }

  private async removeItemsAndRevisions(userUuid: string): Promise<void> {
    const items = await this.itemRepository.findAll({
      userUuid,
      sortBy: 'updated_at_timestamp',
      sortOrder: 'DESC',
    })

    for (const item of items) {
      await this.revisionService.deleteRevisionsForItem(item)

      await this.itemRepository.remove(item)
    }
  }
}
