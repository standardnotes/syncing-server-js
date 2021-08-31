import { injectable } from 'inversify'
import { validate } from 'uuid'
import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'

@injectable()
export class UuidFilter implements ItemSaveRuleInterface {
  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    const validUuid = validate(dto.itemHash.uuid)

    if (!validUuid) {
      return {
        passed: false,
        conflict: {
          unsavedItem: dto.itemHash,
          type: 'uuid_conflict',
        },
      }
    }

    return {
      passed: true,
    }
  }
}
