import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { ProjectorInterface } from '../../Projection/ProjectorInterface'

import { Item } from './Item'
import { ItemConflict } from './ItemConflict'
import { ItemConflictProjection } from './ItemConflictProjection'
import { ItemProjection } from './ItemProjection'

@injectable()
export class ItemConflictProjector implements ProjectorInterface<ItemConflict> {
  constructor(
    @inject(TYPES.ItemProjector) private itemProjector: ProjectorInterface<Item>,
  ) {
  }

  projectSimple(_itemConflict: ItemConflict): Record<string, unknown> {
    throw Error('not implemented')
  }

  projectCustom(_projectionType: string, _itemConflict: ItemConflict): Record<string, unknown> {
    throw Error('not implemented')
  }

  projectFull(itemConflict: ItemConflict): ItemConflictProjection {
    const projection: ItemConflictProjection =  {
      unsaved_item: itemConflict.unsavedItem,
      type: itemConflict.type,
    }

    if (itemConflict.serverItem) {
      projection.server_item = <ItemProjection> this.itemProjector.projectFull(itemConflict.serverItem)
    }

    return projection
  }
}
