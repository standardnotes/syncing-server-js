import { GetItemsResult } from './GetItemsResult'
import { Item } from './Item'
import { SaveItemsResult } from './SaveItemsResult'

export interface ItemServiceInterface {
  getItems(syncToken: string, cursorToken: string, limit: number, contentType?: string): Promise<GetItemsResult>
  saveItems(itemHashes: Array<string>, userAgent: string, retrievedItems: Array<Item>): Promise<SaveItemsResult>
}
