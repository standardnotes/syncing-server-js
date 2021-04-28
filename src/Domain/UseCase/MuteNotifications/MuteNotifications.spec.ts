import 'reflect-metadata'

import { ExtensionSetting } from '../../ExtensionSetting/ExtensionSetting'
import { ExtensionSettingRepositoryInterface } from '../../ExtensionSetting/ExtensionSettingRepositoryInterface'
import { MuteNotifications } from './MuteNotifications'

describe('MuteNotifications', () => {
  let extensionSettingRepository: ExtensionSettingRepositoryInterface

  const createUseCase = () => new MuteNotifications(extensionSettingRepository)

  beforeEach(() => {
    const extensionSetting = {} as jest.Mocked<ExtensionSetting>

    extensionSettingRepository = {} as jest.Mocked<ExtensionSettingRepositoryInterface>
    extensionSettingRepository.findOneByUuid = jest.fn().mockReturnValue(extensionSetting)
    extensionSettingRepository.save = jest.fn()
  })

  it('should not succeed if extension setting is not found', async () => {
    extensionSettingRepository.findOneByUuid = jest.fn().mockReturnValue(undefined)
    expect(await createUseCase().execute({ uuid: '1-2-3' }))
      .toEqual({ success: false, message: 'Could not find extension setting' })
  })

  it('should update mute email setting on extension setting', async () => {
    expect(await createUseCase().execute({ uuid: '1-2-3' }))
      .toEqual({ success: true, message: 'This email has been muted. To unmute, reinstall this extension.' })

    expect(extensionSettingRepository.save).toHaveBeenCalledWith({
      muteEmails: true,
    })
  })
})
