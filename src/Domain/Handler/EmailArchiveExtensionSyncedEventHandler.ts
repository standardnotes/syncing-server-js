import { DomainEventHandlerInterface, DomainEventPublisherInterface, EmailArchiveExtensionSyncedEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
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
    @inject(TYPES.Logger) private logger: Logger,
  ) {
  }

  async handle(event: EmailArchiveExtensionSyncedEvent): Promise<void> {
    const items = await this.itemRepository.findAll({
      userUuid: event.payload.userUuid,
      sortBy: 'updated_at_timestamp',
      sortOrder: 'DESC',
      deleted: false,
    })

    const authParams = await this.authHttpService.getUserKeyParams({
      uuid: event.payload.userUuid,
      authenticated: false,
    })

    const data = JSON.stringify({
      items,
      auth_params: authParams,
    })

    if (data.length > this.emailAttachmentMaxByteSize) {
      this.logger.debug(`Backup email attachment too big: ${data.length}`)
      const extensionSetting = await this.getExtensionSetting(event.payload.extensionId)
      if (extensionSetting.muteEmails) {
        return
      }

      this.logger.debug('Publishing MAIL_BACKUP_ATTACHMENT_TOO_BIG event')

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

    const backupFileName = await this.itemBackupService.backup(items, authParams)

    this.logger.debug(`Data backed up into: ${backupFileName}`)

    if (backupFileName.length !== 0) {
      this.logger.debug('Publishing EMAIL_BACKUP_ATTACHMENT_CREATED event')

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
