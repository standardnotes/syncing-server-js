import { GetItemsDTO } from './GetItemsDTO'
import { GetItemsResult } from './GetItemsResult'
import { Item } from './Item'
import { SaveItemsResult } from './SaveItemsResult'

export interface ItemServiceInterface {
  getItems(dto: GetItemsDTO): Promise<GetItemsResult>
  saveItems(itemHashes: Array<string>, userAgent: string, retrievedItems: Array<Item>): Promise<SaveItemsResult>
}
