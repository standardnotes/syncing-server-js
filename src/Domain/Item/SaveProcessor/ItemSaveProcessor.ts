import { injectable } from 'inversify'
import { ItemSaveFilterInterface } from '../SaveFilter/ItemSaveFilterInterface'
import { ItemSaveProcessingDTO } from './ItemSaveProcessingDTO'
import { ItemSaveProcessingResult } from './ItemSaveProcessingResult'
import { ItemSaveProcessorInterface } from './ItemSaveProcessorInterface'

@injectable()
export class ItemSaveProcessor implements ItemSaveProcessorInterface {
  constructor(
    private filters: Array<ItemSaveFilterInterface>
  ) {
  }

  async process(dto: ItemSaveProcessingDTO): Promise<ItemSaveProcessingResult> {
    for (const filter of this.filters) {
      const result = await filter.filter(dto)
      if (!result.passed) {
        return {
          passed: false,
          conflict: result.conflict,
        }
      }
    }

    return {
      passed: true,
    }
  }
}
