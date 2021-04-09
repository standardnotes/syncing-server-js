import { DomainEventHandlerInterface, DomainEventPublisherInterface, EmailArchiveExtensionSyncedEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { AuthHttpServiceInterface } from '../Auth/AuthHttpServiceInterface'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { ExtensionSetting } from '../ExtensionSetting/ExtensionSetting'
import { ExtensionSettingRepositoryInterface } from '../ExtensionSetting/ExtensionSettingRepositoryInterface'
import { ItemBackupServiceInterface } from '../Item/ItemBackupServiceInterface'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'

@injectable()
export class EmailArchiveExtensionSyncedEventHandler implements DomainEventHandlerInterface {
  constructor (
    @inject(TYPES.ItemRepository) private itemRepository: ItemRepositoryInterface,
    @inject(TYPES.AuthHttpService) private authHttpService: AuthHttpServiceInterface,
    @inject(TYPES.ExtensionSettingRepository) private extensionSettingRepository: ExtensionSettingRepositoryInterface,
    @inject(TYPES.ItemBackupService) private itemBackupService: ItemBackupServiceInterface,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.EMAIL_ATTACHMENT_MAX_BYTE_SIZE) private emailAttachmentMaxByteSize: number,
  ) {
  }

  async handle(event: EmailArchiveExtensionSyncedEvent): Promise<void> {
    const items = await this.itemRepository.findAll({
      userUuid: event.payload.userUuid,
      sortBy: 'updated_at_timestap',
      sortOrder: 'DESC',
      deleted: false,
    })

    const authParams = await this.authHttpService.getUserKeyParams(event.payload.userUuid, false)

    const data = JSON.stringify({
      items,
      auth_params: authParams,
    })

    if (data.length > this.emailAttachmentMaxByteSize) {
      const extensionSetting = await this.getExtensionSetting(event.payload.extensionId)
      if (extensionSetting.muteEmails) {
        return
      }

      await this.domainEventPublisher.publish(
        this.domainEventFactory.createMailBackupAttachmentTooBigEvent({
          allowedSize: `${this.emailAttachmentMaxByteSize}`,
          attachmentSize: `${data.length}`,
          email: authParams.identifier,
          extensionSettingUuid: extensionSetting.uuid,
        })
      )

      return
    }

    const backupFileName = this.itemBackupService.backup(items, authParams)

    if (backupFileName.length !== 0) {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createEmailBackupAttachmentCreatedEvent(backupFileName, authParams.identifier)
      )
    }
  }

  private async getExtensionSetting(extensionId: string): Promise<ExtensionSetting> {
    let extensionSetting = await this.extensionSettingRepository.findOneByExtensionId(extensionId)
    if (extensionSetting === undefined) {
      extensionSetting = new ExtensionSetting()
      extensionSetting.muteEmails = false
      extensionSetting.extensionId = extensionId
      extensionSetting = await this.extensionSettingRepository.save(extensionSetting)
    }

    return extensionSetting
  }
}
