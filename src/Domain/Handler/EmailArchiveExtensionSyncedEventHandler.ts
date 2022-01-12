import { KeyParams } from '@standardnotes/auth'
import { DomainEventHandlerInterface, DomainEventPublisherInterface, EmailArchiveExtensionSyncedEvent } from '@standardnotes/domain-events'
import { MuteFailedBackupsEmailsOption, SettingName } from '@standardnotes/settings'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { AuthHttpServiceInterface } from '../Auth/AuthHttpServiceInterface'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { ItemBackupServiceInterface } from '../Item/ItemBackupServiceInterface'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'

@injectable()
export class EmailArchiveExtensionSyncedEventHandler implements DomainEventHandlerInterface {
  constructor (
    @inject(TYPES.ItemRepository) private itemRepository: ItemRepositoryInterface,
    @inject(TYPES.AuthHttpService) private authHttpService: AuthHttpServiceInterface,
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
      sortOrder: 'ASC',
      deleted: false,
    })

    let authParams: KeyParams
    try {
      authParams = await this.authHttpService.getUserKeyParams({
        uuid: event.payload.userUuid,
        authenticated: false,
      })
    } catch (error) {
      this.logger.warn(`Could not get user key params from auth service: ${error.message}`)

      return
    }

    const data = JSON.stringify({
      items,
      auth_params: authParams,
    })

    if (data.length > this.emailAttachmentMaxByteSize) {
      this.logger.debug(`Backup email attachment too big: ${data.length}`)

      let muteEmailsSetting: { uuid: string, value: string | null }
      try {
        muteEmailsSetting = await this.authHttpService.getUserSetting(event.payload.userUuid, SettingName.MuteFailedBackupsEmails)
      } catch (error) {
        this.logger.warn(`Could not get mute failed backups emails setting from auth service: ${error.message}`)

        return
      }

      if (muteEmailsSetting.value === MuteFailedBackupsEmailsOption.Muted) {
        return
      }

      this.logger.debug('Publishing MAIL_BACKUP_ATTACHMENT_TOO_BIG event')

      await this.domainEventPublisher.publish(
        this.domainEventFactory.createMailBackupAttachmentTooBigEvent({
          allowedSize: `${this.emailAttachmentMaxByteSize}`,
          attachmentSize: `${data.length}`,
          email: authParams.identifier,
          muteEmailsSettingUuid: muteEmailsSetting.uuid,
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
}
