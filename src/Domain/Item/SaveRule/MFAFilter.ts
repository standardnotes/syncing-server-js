import { inject, injectable } from 'inversify'
import TYPES from '../../../Bootstrap/Types'
import { ContentType } from '../ContentType'
import { ItemFactoryInterface } from '../ItemFactoryInterface'
import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'

@injectable()
export class MFAFilter implements ItemSaveRuleInterface {
  constructor (
    @inject(TYPES.ItemFactory) private itemFactory: ItemFactoryInterface,
  ) {
  }

  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    if (dto.itemHash.content_type === ContentType.MFA) {
      const stubItem = this.itemFactory.create(dto.userUuid, dto.itemHash)
      stubItem.uuid = `mfa-${dto.userUuid}`

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
