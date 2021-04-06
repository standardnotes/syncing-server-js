import { ExtensionSetting } from './ExtensionSetting'

export interface ExtensionSettingRepositoryInterface {
  findOneByUuid(uuid: string): Promise<ExtensionSetting | undefined>
  findOneByExtensionId(extensionId: string): Promise<ExtensionSetting | undefined>
  save(extensionSetting: ExtensionSetting): Promise<ExtensionSetting>
}
