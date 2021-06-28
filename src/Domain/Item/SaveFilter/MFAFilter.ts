import { inject, injectable } from 'inversify'
import TYPES from '../../../Bootstrap/Types'
import { ContentType } from '../ContentType'
import { ItemFactoryInterface } from '../ItemFactoryInterface'
import { ItemSaveProcessingDTO } from '../SaveProcessor/ItemSaveProcessingDTO'
import { ItemSaveFilteringResult } from './ItemSaveFilteringResult'
import { ItemSaveFilterInterface } from './ItemSaveFilterInterface'

@injectable()
export class MFAFilter implements ItemSaveFilterInterface {
  constructor (
    @inject(TYPES.ItemFactory) private itemFactory: ItemFactoryInterface,
  ) {
  }

  async filter(dto: ItemSaveProcessingDTO): Promise<ItemSaveFilteringResult> {
    if (dto.itemHash.content_type === ContentType.MFA) {
      const stubItem = this.itemFactory.create(dto.userUuid, dto.itemHash)

      return {
        passed: false,
        skipped: stubItem,
      }
    }

    return {
      passed: true,
    }
  }
}
