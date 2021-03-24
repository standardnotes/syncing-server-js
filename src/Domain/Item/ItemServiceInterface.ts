import { GetItemsDTO } from './GetItemsDTO'
import { GetItemsResult } from './GetItemsResult'
import { SaveItemsDTO } from './SaveItemsDTO'
import { SaveItemsResult } from './SaveItemsResult'

export interface ItemServiceInterface {
  getItems(dto: GetItemsDTO): Promise<GetItemsResult>
  saveItems(dto: SaveItemsDTO): Promise<SaveItemsResult>
}
