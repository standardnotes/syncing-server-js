import { ContentType } from '@standardnotes/common'
import { AccountDeletionRequestedEvent, DomainEventHandlerInterface, DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { Frequency } from '../ExtensionSetting/Frequency'
import { ContentDecoderInterface } from '../Item/ContentDecoderInterface'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { ServiceTransitionHelperInterface } from '../Transition/ServiceTransitionHelperInterface'

@injectable()
export class AccountDeletionRequestedEventHandler implements DomainEventHandlerInterface {
  constructor (
    @inject(TYPES.ItemRepository) private itemRepository: ItemRepositoryInterface,
    @inject(TYPES.ContentDecoder) private contentDecoder: ContentDecoderInterface,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.ServiceTransitionHelper) private serviceTransitionHelper: ServiceTransitionHelperInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {
  }

  async handle(event: AccountDeletionRequestedEvent): Promise<void> {
    await this.syncExtensionsRemoval(event.payload.userUuid)

    await this.itemRepository.deleteByUserUuid(event.payload.userUuid)

    await this.serviceTransitionHelper.deleteUserMFAUserSettings(event.payload.userUuid)

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
          skipFileBackup: true,
        })
      )
    }
  }
}
