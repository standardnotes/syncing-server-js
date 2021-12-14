import { KeyParams } from '@standardnotes/auth'
import { FeatureDescription } from '@standardnotes/features'
import { SettingName } from 'aws-sdk/clients/ecs'

export interface AuthHttpServiceInterface {
  getUserKeyParams(dto: { email?: string, uuid?: string, authenticated: boolean }): Promise<KeyParams>
  getUserFeatures(userUuid: string): Promise<Array<FeatureDescription>>
  getUserSetting(userUuid: string, settingName: SettingName): Promise<{ uuid: string, value: string | null }>
}
