import { ItemSaveProcessingDTO } from '../SaveProcessor/ItemSaveProcessingDTO'
import { ItemSaveFilteringResult } from './ItemSaveFilteringResult'
import { ItemSaveFilterInterface } from './ItemSaveFilterInterface'

export class OwnershipFilter implements ItemSaveFilterInterface {
  async filter(dto: ItemSaveProcessingDTO): Promise<ItemSaveFilteringResult> {
    const itemBelongsToADifferentUser = dto.existingItem !== undefined && dto.existingItem.userUuid !== dto.userUuid
    if (!itemBelongsToADifferentUser) {
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
