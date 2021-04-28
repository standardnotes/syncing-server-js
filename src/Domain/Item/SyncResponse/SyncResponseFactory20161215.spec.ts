import 'reflect-metadata'
import { ProjectorInterface } from '../../../Projection/ProjectorInterface'

import { Item } from '../Item'
import { ItemHash } from '../ItemHash'
import { ItemProjection } from '../ItemProjection'
import { SyncResponseFactory20161215 } from './SyncResponseFactory20161215'

describe('SyncResponseFactory20161215', () => {
  let itemProjector: ProjectorInterface<Item>
  let itemProjection: ItemProjection
  let item1: Item
  let item2: Item

  const createFactory = () => new SyncResponseFactory20161215(itemProjector)

  beforeEach(() => {
    itemProjector = {} as jest.Mocked<ProjectorInterface<Item>>
    itemProjector.projectFull = jest.fn().mockReturnValue(itemProjection)

    item1 = {} as jest.Mocked<Item>

    item2 = {} as jest.Mocked<Item>
  })

  it('should turn sync items response into a sync response for API Version 20161215', () => {
    const itemHash1 = {} as jest.Mocked<ItemHash>
    expect(createFactory().createResponse({
      retrievedItems: [ item1 ],
      savedItems: [ item2 ],
      conflicts: [
        {
          serverItem: item1,
          type: 'sync_conflict',
        },
        {
          unsavedItem: itemHash1,
          type: 'uuid_conflict',
        },
      ],
      syncToken: 'sync-test',
      integrityHash: 'test-hash',
      cursorToken: 'cursor-test',
    })).toEqual({
      retrieved_items: [ itemProjection ],
      saved_items: [ itemProjection ],
      unsaved: [
        {
          item: itemProjection,
          error: {
            tag: 'sync_conflict',
          },
        },
        {
          item: itemHash1,
          error: {
            tag: 'uuid_conflict',
          },
        },
      ],
      sync_token: 'sync-test',
      integrity_hash: 'test-hash',
      cursor_token: 'cursor-test',
    })
  })
})
