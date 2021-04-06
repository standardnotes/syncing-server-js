import 'reflect-metadata'

import { Item } from '../Item'
import { ItemHash } from '../ItemHash'
import { SyncResponseFactory20161215 } from './SyncResponseFactory20161215'

describe('SyncResponseFactory20161215', () => {
  const createFactory = () => new SyncResponseFactory20161215()

  it('should turn sync items response into a sync response for API Version 20161215', () => {
    const item1 = {} as jest.Mocked<Item>
    const itemHash1 = {} as jest.Mocked<ItemHash>
    expect(createFactory().createResponse({
      retrievedItems: [],
      savedItems: [],
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
      retrieved_items: [],
      saved_items: [],
      unsaved: [
        {
          item: item1,
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
