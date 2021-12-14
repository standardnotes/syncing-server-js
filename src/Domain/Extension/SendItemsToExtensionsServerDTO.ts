import { KeyParams } from '@standardnotes/auth'
import { Item } from '../Item/Item'

export type SendItemsToExtensionsServerDTO = {
  extensionsServerUrl: string
  extensionId: string
  backupFilename: string
  authParams: KeyParams
  forceMute: boolean
  userUuid: string
  muteEmailsSettingUuid?: string
  items?: Array<Item>
}
