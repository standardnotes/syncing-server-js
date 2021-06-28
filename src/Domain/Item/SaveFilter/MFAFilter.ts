import { injectable } from 'inversify'
import { ContentType } from '../ContentType'
import { ItemSaveProcessingDTO } from '../SaveProcessor/ItemSaveProcessingDTO'
import { ItemSaveFilteringResult } from './ItemSaveFilteringResult'
import { ItemSaveFilterInterface } from './ItemSaveFilterInterface'

@injectable()
export class MFAFilter implements ItemSaveFilterInterface {
  async filter(dto: ItemSaveProcessingDTO): Promise<ItemSaveFilteringResult> {
    if (dto.itemHash.content_type === ContentType.MFA) {
      return {
        passed: false,
      }
    }

    return {
      passed: true,
    }
  }
}
