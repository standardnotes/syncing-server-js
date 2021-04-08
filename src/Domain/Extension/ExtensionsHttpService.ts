import { DomainEventFactoryInterface, DomainEventInterface, DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { SuperAgentStatic } from 'superagent'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { ExtensionSetting } from '../ExtensionSetting/ExtensionSetting'
import { ExtensionSettingRepositoryInterface } from '../ExtensionSetting/ExtensionSettingRepositoryInterface'
import { ContentDecoderInterface } from '../Item/ContentDecoderInterface'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { ExtensionName } from './ExtensionName'
import { ExtensionsHttpServiceInterface } from './ExtensionsHttpServiceInterface'
import { SendItemsToExtensionsServerDTO } from './SendItemsToExtensionsServerDTO'

@injectable()
export class ExtensionsHttpService implements ExtensionsHttpServiceInterface {
  constructor (
    @inject(TYPES.HTTPClient) private httpClient: SuperAgentStatic,
    @inject(TYPES.ExtensionSettingRepository) private extensionSettingRepository: ExtensionSettingRepositoryInterface,
    @inject(TYPES.ItemRepository) private itemRepository: ItemRepositoryInterface,
    @inject(TYPES.ContentDecoder) private contentDecoder: ContentDecoderInterface,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.Logger) private logger: Logger
  ) {
  }

  async sendItemsToExtensionsServer(dto: SendItemsToExtensionsServerDTO): Promise<void> {
    const emailMuteSettings = await this.shouldEmailsBeMuted(dto.forceMute, dto.extensionId)

    let sent = false
    try {
      const response = await this.httpClient
        .post(dto.extensionsServerUrl)
        .set('Content-Type', 'application/json')
        .send({
          items: dto.items,
          backup_filename: dto.backupFilename,
          auth_params: dto.authParams,
          silent: emailMuteSettings.muteEmails,
          user_uuid: dto.userUuid,
          settings_id: emailMuteSettings.extensionSetting.uuid,
        })

      sent = response.ok
    } catch (error) {
      this.logger.error(`Failed to send a request to extensions server: ${error.message}`)
    }

    if (!sent && !emailMuteSettings.muteEmails) {
      await this.domainEventPublisher.publish(
        await this.getBackupFailedEvent(
          emailMuteSettings.extensionSetting.uuid,
          dto.extensionId,
          dto.userUuid,
          dto.authParams.identifier
        )
      )
    }
  }

  private async getBackupFailedEvent(extensionSettingUuid: string, extensionId: string, userUuid: string, email: string): Promise<DomainEventInterface> {
    const extension = await this.itemRepository.findByUuidAndUserUuid(extensionId, userUuid)
    if (extension === undefined || !extension.content) {
      throw Error(`Could not find extensions with id ${extensionId}`)
    }

    const content = this.contentDecoder.decode(extension.content)
    switch(this.getExtensionName(content)) {
    case ExtensionName.Dropbox:
      return this.domainEventFactory.createDropboxBackupFailedEvent(extensionSettingUuid, email)
    case ExtensionName.GoogleDrive:
      return this.domainEventFactory.createGoogleDriveBackupFailedEvent(extensionSettingUuid, email)
    case ExtensionName.OneDrive:
      return this.domainEventFactory.createOneDriveBackupFailedEvent(extensionSettingUuid, email)
    }

  }

  private getExtensionName(content: Record<string, unknown>): ExtensionName {
    if ('name' in content) {
      return <ExtensionName> content.name
    }

    const url = 'url' in content ? <string> content.url : undefined

    if (url) {
      if (url.indexOf('dbt') !== -1) {
        return ExtensionName.Dropbox
      } else if (url.indexOf('gdrive') !== -1) {
        return ExtensionName.GoogleDrive
      } else if (url.indexOf('onedrive') !== -1) {
        return ExtensionName.OneDrive
      }
    }

    throw Error('Could not deduce extension name from extension content')
  }

  private async shouldEmailsBeMuted(forceMute: boolean, extensionId: string): Promise<{ muteEmails: boolean, extensionSetting: ExtensionSetting }> {
    let extensionSetting = await this.extensionSettingRepository.findOneByExtensionId(extensionId)
    if (!extensionSetting) {
      extensionSetting = new ExtensionSetting()
      extensionSetting.muteEmails = false
      extensionSetting.extensionId = extensionId
      extensionSetting = await this.extensionSettingRepository.save(extensionSetting)
    }

    return {
      muteEmails: forceMute || extensionSetting.muteEmails,
      extensionSetting,
    }
  }
}
