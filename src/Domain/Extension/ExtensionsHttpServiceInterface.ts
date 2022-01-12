import { KeyParams } from '@standardnotes/auth'
import { SendItemsToExtensionsServerDTO } from './SendItemsToExtensionsServerDTO'

export interface ExtensionsHttpServiceInterface {
  triggerCloudBackupOnExtensionsServer(dto: {
    cloudProvider: 'DROPBOX' | 'GOOGLE_DRIVE' | 'ONE_DRIVE',
    extensionsServerUrl: string
    backupFilename: string
    authParams: KeyParams
    forceMute: boolean
    userUuid: string
    muteEmailsSettingUuid: string
  }): Promise<void>
  sendItemsToExtensionsServer(dto: SendItemsToExtensionsServerDTO): Promise<void>
}
