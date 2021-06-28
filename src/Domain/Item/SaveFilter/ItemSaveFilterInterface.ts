import { ItemSaveProcessingDTO } from '../SaveProcessor/ItemSaveProcessingDTO'
import { ItemSaveFilteringResult } from './ItemSaveFilteringResult'

export interface ItemSaveFilterInterface {
  filter(dto: ItemSaveProcessingDTO): Promise<ItemSaveFilteringResult>
}
