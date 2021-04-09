import { KeyParams } from '@standardnotes/auth'
import { Item } from '../Item/Item'

export type SendItemsToExtensionsServerDTO = {
  extensionsServerUrl: string
  extensionId: string
  items: Array<Item>
  backupFilename: string
  authParams: KeyParams
  forceMute: boolean
  userUuid: string
}
