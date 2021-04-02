import 'reflect-metadata'
import { ContentType } from '../Item/ContentType'
import { Item } from '../Item/Item'
import { ItemHash } from '../Item/ItemHash'
import { ItemServiceInterface } from '../Item/ItemServiceInterface'
import { SyncResponse20200115 } from '../Item/SyncResponse/SyncResponse20200115'
import { SyncResponseFactoryInterface } from '../Item/SyncResponse/SyncResponseFactoryInterface'
import { SyncResponseFactoryResolverInterface } from '../Item/SyncResponse/SyncResponseFactoryResolverInterface'

import { SyncItems } from './SyncItems'

describe('SyncItems', () => {
  let itemService: ItemServiceInterface
  let syncResponceFactoryResolver: SyncResponseFactoryResolverInterface
  let syncResponseFactory: SyncResponseFactoryInterface
  let syncResponse: SyncResponse20200115
  let item1: Item
  let item2: Item
  let item3: Item
  let itemHash: ItemHash

  const createUseCase = () => new SyncItems(itemService, syncResponceFactoryResolver)

  beforeEach(() => {
    item1 = {
      uuid: '1-2-3',
    } as jest.Mocked<Item>
    item2 = {
      uuid: '2-3-4',
    } as jest.Mocked<Item>
    item3 = {
      uuid: '3-4-5',
    } as jest.Mocked<Item>

    itemHash = {
      uuid: '2-3-4',
      content: 'asdqwe',
      content_type: ContentType.Note,
      duplicate_of: null,
      enc_item_key: 'qweqwe',
      items_key_id: 'asdasd',
      created_at: '2021-02-19T11:35:45.655Z',
      updated_at: '2021-03-25T09:37:37.944Z',
    }

    itemService = {} as jest.Mocked<ItemServiceInterface>
    itemService.getItems = jest.fn().mockReturnValue({
      items: [ item1 ],
      cursorToken: 'asdzxc',
    })
    itemService.saveItems = jest.fn().mockReturnValue({
      savedItems: [ item2 ],
      conflicts: [],
      syncToken: 'qwerty',
    })
    itemService.frontLoadKeysItemsToTop = jest.fn().mockReturnValue([ item3, item1 ])

    syncResponse = {} as jest.Mocked<SyncResponse20200115>

    syncResponseFactory = {} as jest.Mocked<SyncResponseFactoryInterface>
    syncResponseFactory.createResponse = jest.fn().mockReturnValue(syncResponse)

    syncResponceFactoryResolver = {} as jest.Mocked<SyncResponseFactoryResolverInterface>
    syncResponceFactoryResolver.resolveSyncResponseFactoryVersion = jest.fn().mockReturnValue(syncResponseFactory)
  })

  it('should sync items', async() => {
    expect(await createUseCase().execute({
      userUuid: '1-2-3',
      itemHashes: [ itemHash ],
      computeIntegrityHash: false,
      syncToken: 'foo',
      cursorToken: 'bar',
      limit: 10,
      userAgent: 'Google Chrome',
      contentType: 'Note',
    })).toEqual(syncResponse)


    expect(syncResponseFactory.createResponse).toHaveBeenCalledWith({
      conflicts: [],
      cursorToken: 'asdzxc',
      retrievedItems: [
        item1,
      ],
      savedItems: [
        item2,
      ],
      syncToken: 'qwerty',
    })
    expect(itemService.frontLoadKeysItemsToTop).not.toHaveBeenCalled()
    expect(itemService.getItems).toHaveBeenCalledWith({
      contentType: 'Note',
      cursorToken: 'bar',
      limit: 10,
      syncToken: 'foo',
      userUuid: '1-2-3',
    })
    expect(itemService.saveItems).toHaveBeenCalledWith({
      itemHashes: [ itemHash ],
      userAgent: 'Google Chrome',
      userUuid: '1-2-3',
    })
  })

  it('should sync items and return items keys on top for first sync', async() => {
    expect(await createUseCase().execute({
      userUuid: '1-2-3',
      itemHashes: [ itemHash ],
      computeIntegrityHash: false,
      limit: 10,
      userAgent: 'Google Chrome',
      contentType: 'Note',
    })).toEqual(syncResponse)

    expect(syncResponseFactory.createResponse).toHaveBeenCalledWith({
      conflicts: [],
      cursorToken: 'asdzxc',
      retrievedItems: [
        item3,
        item1,
      ],
      savedItems: [
        item2,
      ],
      syncToken: 'qwerty',
    })
  })

  it('should sync items and compute an integrity hash if prompted', async() => {
    itemService.computeIntegrityHash = jest.fn().mockReturnValue('test-hash')
    expect(await createUseCase().execute({
      userUuid: '1-2-3',
      itemHashes: [ itemHash ],
      computeIntegrityHash: true,
      limit: 10,
      userAgent: 'Google Chrome',
      contentType: 'Note',
    })).toEqual(syncResponse)

    expect(syncResponseFactory.createResponse).toHaveBeenCalledWith({
      conflicts: [],
      cursorToken: 'asdzxc',
      integrityHash: 'test-hash',
      retrievedItems: [
        item3,
        item1,
      ],
      savedItems: [
        item2,
      ],
      syncToken: 'qwerty',
    })
  })

  it('should sync items and return filtered out sync conflicts for consecutive sync operations', async() => {
    itemService.getItems = jest.fn().mockReturnValue({
      items: [ item1, item2 ],
      cursorToken: 'asdzxc',
    })

    itemService.saveItems = jest.fn().mockReturnValue({
      savedItems: [],
      conflicts: [
        {
          serverItem: item2,
          type: 'sync_conflict',
        },
        {
          serverItem: undefined,
          type: 'sync_conflict',
        },
      ],
      syncToken: 'qwerty',
    })

    await createUseCase().execute({
      userUuid: '1-2-3',
      itemHashes: [ itemHash ],
      computeIntegrityHash: false,
      syncToken: 'foo',
      cursorToken: 'bar',
      limit: 10,
      userAgent: 'Google Chrome',
      contentType: 'Note',
    })

    expect(syncResponseFactory.createResponse).toHaveBeenCalledWith({
      conflicts: [
        {
          serverItem: item2,
          type: 'sync_conflict',
        },
        {
          serverItem: undefined,
          type: 'sync_conflict',
        },
      ],
      cursorToken: 'asdzxc',
      retrievedItems: [
        item1,
      ],
      savedItems: [
      ],
      syncToken: 'qwerty',
    })
  })
})
