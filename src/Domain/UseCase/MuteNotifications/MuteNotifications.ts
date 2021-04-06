import { inject, injectable } from 'inversify'
import TYPES from '../../../Bootstrap/Types'
import { ExtensionSettingRepositoryInterface } from '../../ExtensionSetting/ExtensionSettingRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { MuteNotificationsDTO } from './MuteNotificationsDTO'
import { MuteNotificationsResponse } from './MuteNotificationsResponse'

@injectable()
export class MuteNotifications implements UseCaseInterface {
  constructor (
    @inject(TYPES.ExtensionSettingRepository) private extensionSettingRepository: ExtensionSettingRepositoryInterface,
  ) {
  }

  async execute(dto: MuteNotificationsDTO): Promise<MuteNotificationsResponse> {
    const extensionSetting = await this.extensionSettingRepository.findOneByUuid(dto.uuid)
    if (extensionSetting === undefined) {
      return {
        success: false,
        message: 'Could not find extension setting',
      }
    }

    extensionSetting.muteEmails = true

    await this.extensionSettingRepository.save(extensionSetting)

    return {
      success: true,
      message: 'This email has been muted. To unmute, reinstall this extension.',
    }
  }
}
