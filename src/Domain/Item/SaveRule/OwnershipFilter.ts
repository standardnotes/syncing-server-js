import { injectable } from 'inversify'
import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'
import { ItemConflictType } from '../ItemConflictType'

@injectable()
export class OwnershipFilter implements ItemSaveRuleInterface {
  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    const itemBelongsToADifferentUser = dto.existingItem !== undefined && dto.existingItem.userUuid !== dto.userUuid
    if (itemBelongsToADifferentUser) {
      return {
        passed: false,
        conflict: {
          unsavedItem: dto.itemHash,
          type: ItemConflictType.UuidConflict,
        },
      }
    }

    return {
      passed: true,
    }
  }
}
