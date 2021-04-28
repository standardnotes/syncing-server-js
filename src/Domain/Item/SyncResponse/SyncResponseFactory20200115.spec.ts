import 'reflect-metadata'
import { ProjectorInterface } from '../../../Projection/ProjectorInterface'
import { Item } from '../Item'
import { ItemConflict } from '../ItemConflict'
import { ItemConflictProjection } from '../ItemConflictProjection'
import { ItemProjection } from '../ItemProjection'

import { SyncResponseFactory20200115 } from './SyncResponseFactory20200115'

describe('SyncResponseFactory20200115', () => {
  let itemProjector: ProjectorInterface<Item>
  let itemConflictProjector: ProjectorInterface<ItemConflict>
  let itemProjection: ItemProjection
  let itemConflictProjection: ItemConflictProjection
  let item1: Item
  let item2: Item
  let itemConflict: ItemConflict

  const createFactory = () => new SyncResponseFactory20200115(itemProjector, itemConflictProjector)

  beforeEach(() => {
    itemProjector = {} as jest.Mocked<ProjectorInterface<Item>>
    itemProjector.projectFull = jest.fn().mockReturnValue(itemProjection)

    itemConflictProjector = {} as jest.Mocked<ProjectorInterface<ItemConflict>>
    itemConflictProjector.projectFull = jest.fn().mockReturnValue(itemConflictProjection)

    item1 = {} as jest.Mocked<Item>

    item2 = {} as jest.Mocked<Item>

    itemConflict = {} as jest.Mocked<ItemConflict>
  })

  it('should turn sync items response into a sync response for API Version 20200115', () => {
    expect(createFactory().createResponse({
      retrievedItems: [ item1 ],
      savedItems: [ item2 ],
      conflicts: [ itemConflict ],
      syncToken: 'sync-test',
      integrityHash: 'test-hash',
      cursorToken: 'cursor-test',
    })).toEqual({
      retrieved_items: [ itemProjection ],
      saved_items: [ itemProjection ],
      conflicts: [ itemConflictProjection ],
      sync_token: 'sync-test',
      integrity_hash: 'test-hash',
      cursor_token: 'cursor-test',
    })
  })
})
