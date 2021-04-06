import 'reflect-metadata'

import { SyncResponseFactory20200115 } from './SyncResponseFactory20200115'

describe('SyncResponseFactory20200115', () => {
  const createFactory = () => new SyncResponseFactory20200115()

  it('should turn sync items response into a sync response for API Version 20200115', () => {
    expect(createFactory().createResponse({
      retrievedItems: [],
      savedItems: [],
      conflicts: [],
      syncToken: 'sync-test',
      integrityHash: 'test-hash',
      cursorToken: 'cursor-test',
    })).toEqual({
      retrieved_items: [],
      saved_items: [],
      conflicts: [],
      sync_token: 'sync-test',
      integrity_hash: 'test-hash',
      cursor_token: 'cursor-test',
    })
  })
})
