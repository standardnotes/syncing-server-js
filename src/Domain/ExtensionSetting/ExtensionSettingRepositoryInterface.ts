import { ExtensionSetting } from './ExtensionSetting'

export interface ExtensionSettingRepositoryInterface {
  findOneByExtensionId(extensionId: string): Promise<ExtensionSetting | undefined>
  save(extensionSetting: ExtensionSetting): Promise<ExtensionSetting>
}
