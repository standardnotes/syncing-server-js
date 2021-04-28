import { KeyParams } from '@standardnotes/auth'
import { Item } from './Item'

export interface ItemBackupServiceInterface {
  backup(items: Array<Item>, authParams: KeyParams): Promise<string>
}
