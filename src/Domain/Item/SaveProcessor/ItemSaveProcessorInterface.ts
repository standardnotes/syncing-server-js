import { ItemSaveProcessingDTO } from './ItemSaveProcessingDTO'
import { ItemSaveProcessingResult } from './ItemSaveProcessingResult'

export interface ItemSaveProcessorInterface {
  process(dto: ItemSaveProcessingDTO): Promise<ItemSaveProcessingResult>
}
