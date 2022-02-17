import { KeyParams } from '@standardnotes/auth'
import { SettingName } from 'aws-sdk/clients/ecs'

export interface AuthHttpServiceInterface {
  getUserKeyParams(dto: { email?: string, uuid?: string, authenticated: boolean }): Promise<KeyParams>
  getUserSetting(userUuid: string, settingName: SettingName): Promise<{ uuid: string, value: string | null }>
}
