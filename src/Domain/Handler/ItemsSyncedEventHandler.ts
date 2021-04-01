import { DomainEventHandlerInterface, ItemsSyncedEvent } from '@standardnotes/domain-events'
import { SuperAgentStatic } from 'superagent'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { ItemQuery } from '../Item/ItemQuery'
import { AuthHttpServiceInterface } from '../Auth/AuthHttpServiceInterface'
import { ExtensionSettingRepositoryInterface } from '../ExtensionSetting/ExtensionSettingRepositoryInterface'
import { ExtensionSetting } from '../ExtensionSetting/ExtensionSetting'
import { Item } from '../Item/Item'

@injectable()
export class ItemsSyncedEventHandler implements DomainEventHandlerInterface {
  constructor (
    @inject(TYPES.HTTPClient) private httpClient: SuperAgentStatic,
    @inject(TYPES.ItemRepository) private itemRepository: ItemRepositoryInterface,
    @inject(TYPES.AuthHttpService) private authHttpService: AuthHttpServiceInterface,
    @inject(TYPES.ExtensionSettingRepository) private extensionSettingRepository: ExtensionSettingRepositoryInterface,
    @inject(TYPES.INTERNAL_DNS_REROUTE_ENABLED) private internalDNSRerouteEnabled: boolean,
    @inject(TYPES.EXTENSIONS_SERVER_URL) private extensionsServerUrl: string
  ) {
  }

  async handle(event: ItemsSyncedEvent): Promise<void> {
    const items = await this.getItemsForPostingToExtension(event)

    const authParams = await this.authHttpService.getUserKeyParams(event.payload.userUuid, false)

    const emailMuteSettings = await this.shouldEmailsBeMuted(event)

    await this.httpClient
      .post(this.getExtensionsServerUrl(event))
      .set('Content-Type', 'application/json')
      .send({
        items,
        auth_params: authParams,
        silent: emailMuteSettings.muteEmails,
        user_uuid: event.payload.userUuid,
        settings_id: emailMuteSettings.extensionSetting.uuid,
      })
  }

  private getExtensionsServerUrl(event: ItemsSyncedEvent): string {
    if (this.internalDNSRerouteEnabled) {
      return event.payload.extensionUrl.replace(
        'https://extensions.standardnotes.org',
        this.extensionsServerUrl
      )
    }

    return event.payload.extensionUrl
  }

  private async getItemsForPostingToExtension(event: ItemsSyncedEvent): Promise<Item[]> {
    const itemQuery: ItemQuery = {
      userUuid: event.payload.userUuid,
      sortBy: 'updated_at_timestap',
      sortOrder: 'DESC',
    }
    if (event.payload.itemUuids.length) {
      itemQuery.uuids = event.payload.itemUuids
    } else {
      itemQuery.deleted = false
    }

    return this.itemRepository.findAll(itemQuery)
  }

  private async shouldEmailsBeMuted(event: ItemsSyncedEvent): Promise<{ muteEmails: boolean, extensionSetting: ExtensionSetting }> {
    let extensionSetting = await this.extensionSettingRepository.findOneByExtensionId(event.payload.extensionId)
    if (!extensionSetting) {
      extensionSetting = new ExtensionSetting()
      extensionSetting.muteEmails = false
      extensionSetting.extensionId = event.payload.extensionId
      extensionSetting = await this.extensionSettingRepository.save(extensionSetting)
    }

    return {
      muteEmails: event.payload.forceMute || extensionSetting.muteEmails,
      extensionSetting,
    }
  }
}
