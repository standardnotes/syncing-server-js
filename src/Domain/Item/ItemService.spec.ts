import 'reflect-metadata'

import * as dayjs from 'dayjs'
import { TimerInterface } from '../Time/TimerInterface'
import { Item } from './Item'
import { ItemHash } from './ItemHash'

import { ItemRepositoryInterface } from './ItemRepositoryInterface'
import { ItemService } from './ItemService'
import { ContentType } from './ContentType'
import { Time } from '../Time/Time'

describe('ItemService', () => {
  let itemRepository: ItemRepositoryInterface
  let timer: TimerInterface
  let item1: Item
  let item2: Item
  let itemHash1: ItemHash
  let itemHash2: ItemHash
  let syncToken: string

  const createService = () => new ItemService(itemRepository, timer)

  beforeEach(() => {
    item1 = {
      uuid: '1-2-3',
      updatedAt: 1616164633241311
    } as jest.Mocked<Item>
    item2 = {
      uuid: '2-3-4',
      updatedAt: 1616164633241312
    } as jest.Mocked<Item>

    itemHash1 = {
      uuid: '1-2-3',
      content: 'asdqwe1',
      content_type: ContentType.Note,
      duplicate_of: null,
      enc_item_key: 'qweqwe1',
      items_key_id: 'asdasd1',
      created_at: '2021-02-19T11:35:45.651Z',
      updated_at: '2021-03-25T09:37:37.941Z'
    } as jest.Mocked<ItemHash>

    itemHash2 = {
      uuid: '2-3-4',
      content: 'asdqwe2',
      content_type: ContentType.Note,
      duplicate_of: null,
      enc_item_key: 'qweqwe2',
      items_key_id: 'asdasd2',
      created_at: '2021-02-19T11:35:45.652Z',
      updated_at: '2021-03-25T09:37:37.942Z'
    } as jest.Mocked<ItemHash>

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findAll = jest.fn().mockReturnValue([item1, item2])
    itemRepository.save = jest.fn().mockImplementation((item: Item) => item)

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(1616164633241568)

    syncToken = Buffer.from('2:1616164633.241564', 'utf-8').toString('base64')
  })

  it('should retrieve all items for a user from last sync with sync token version 1', async () => {
    syncToken = Buffer.from('1:2021-03-15 07:00:00', 'utf-8').toString('base64')
    timer.convertStringDateToMicroseconds = jest.fn().mockReturnValue(dayjs.utc('2021-03-15 07:00:00').valueOf() * 1000)

    expect(
      await createService().getItems({
        userUuid: '1-2-3',
        syncToken,
        limit: 100,
        contentType: ContentType.Note
      })
    ).toEqual({
      items: [ item1, item2 ]
    })

    expect(itemRepository.findAll).toHaveBeenCalledWith({
      contentType: 'Note',
      lastSyncTime: 1615791600000000,
      syncTimeComparison: '>',
      sortBy: 'updated_at_timestamp',
      sortOrder: 'DESC',
      userUuid: '1-2-3'
    })
  })

  it('should retrieve all items for a user from last sync', async () => {
    expect(
      await createService().getItems({
        userUuid: '1-2-3',
        syncToken,
        limit: 100,
        contentType: ContentType.Note
      })
    ).toEqual({
      items: [ item1, item2 ]
    })

    expect(itemRepository.findAll).toHaveBeenCalledWith({
      contentType: 'Note',
      lastSyncTime: 1616164633241564,
      syncTimeComparison: '>',
      sortBy: 'updated_at_timestamp',
      sortOrder: 'DESC',
      userUuid: '1-2-3'
    })
  })

  it('should return a cursor token if there are more items than requested with limit', async () => {
    const itemsResponse = await createService().getItems({
      userUuid: '1-2-3',
      syncToken,
      limit: 1,
      contentType: ContentType.Note
    })

    expect(itemsResponse).toEqual({
      cursorToken: 'MjoxNjE2MTY0NjMzLjI0MTMxMQ==',
      items: [ item1 ]
    })

    expect(Buffer.from(<string> itemsResponse.cursorToken, 'base64').toString('utf-8')).toEqual('2:1616164633.241311')

    expect(itemRepository.findAll).toHaveBeenCalledWith({
      contentType: 'Note',
      lastSyncTime: 1616164633241564,
      syncTimeComparison: '>',
      sortBy: 'updated_at_timestamp',
      sortOrder: 'DESC',
      userUuid: '1-2-3'
    })
  })

  it('should retrieve all items for a user from cursor token', async () => {
    const cursorToken = Buffer.from('2:1616164633.241123', 'utf-8').toString('base64')

    expect(
      await createService().getItems({
        userUuid: '1-2-3',
        syncToken,
        cursorToken,
        limit: 100,
        contentType: ContentType.Note
      })
    ).toEqual({
      items: [ item1, item2 ]
    })

    expect(itemRepository.findAll).toHaveBeenCalledWith({
      contentType: 'Note',
      lastSyncTime: 1616164633241123,
      syncTimeComparison: '>=',
      sortBy: 'updated_at_timestamp',
      sortOrder: 'DESC',
      userUuid: '1-2-3'
    })
  })

  it('should retrieve all undeleted items for a user without cursor or sync token', async () => {
    expect(
      await createService().getItems({
        userUuid: '1-2-3',
        limit: 100,
        contentType: ContentType.Note
      })
    ).toEqual({
      items: [ item1, item2 ]
    })

    expect(itemRepository.findAll).toHaveBeenCalledWith({
      contentType: 'Note',
      deleted: false,
      sortBy: 'updated_at_timestamp',
      sortOrder: 'DESC',
      syncTimeComparison: '>',
      userUuid: '1-2-3'
    })
  })

  it('should retrieve all items with default limit if not defined', async () => {
    await createService().getItems({
      userUuid: '1-2-3',
      syncToken,
      contentType: ContentType.Note
    })

    expect(itemRepository.findAll).toHaveBeenCalledWith({
      contentType: 'Note',
      lastSyncTime: 1616164633241564,
      syncTimeComparison: '>',
      sortBy: 'updated_at_timestamp',
      sortOrder: 'DESC',
      userUuid: '1-2-3'
    })
  })

  it('should retrieve all items with non-positive limit if not defined', async () => {
    await createService().getItems({
      userUuid: '1-2-3',
      syncToken,
      limit: 0,
      contentType: ContentType.Note
    })

    expect(itemRepository.findAll).toHaveBeenCalledWith({
      contentType: 'Note',
      lastSyncTime: 1616164633241564,
      syncTimeComparison: '>',
      sortBy: 'updated_at_timestamp',
      sortOrder: 'DESC',
      userUuid: '1-2-3'
    })
  })

  it('should throw an error if the sync token is missing time', async () => {
    let error = null

    try {
      await createService().getItems({
        userUuid: '1-2-3',
        syncToken: '2:',
        limit: 0,
        contentType: ContentType.Note
      })
    } catch (e) {
      error = e
    }

    expect(error).not.toBeNull()
  })

  it('should throw an error if the sync token is missing version', async () => {
    let error = null

    try {
      await createService().getItems({
        userUuid: '1-2-3',
        syncToken: '1234567890',
        limit: 0,
        contentType: ContentType.Note
      })
    } catch (e) {
      error = e
    }

    expect(error).not.toBeNull()
  })

  it('should front load keys items to top of the collection for better client performance', async () => {
    const item3 = {
      uuid: '1-2-3'
    } as jest.Mocked<Item>
    const item4 = {
      uuid: '4-5-6'
    } as jest.Mocked<Item>

    itemRepository.findAll = jest.fn().mockReturnValue([ item3, item4 ])

    await createService().frontLoadKeysItemsToTop('1-2-3', [ item1, item2 ])
  })

  it('should save new items', async () => {
    itemRepository.findByUuidAndUserUuid = jest.fn().mockReturnValue(null)

    const result = await createService().saveItems({
      itemHashes: [ itemHash1 ],
      userAgent: 'Brave',
      userUuid: '1-2-3'
    })

    expect(result).toEqual({
      conflicts: [],
      savedItems: [
        {
          content: 'asdqwe1',
          contentType: 'Note',
          createdAt: expect.any(Number),
          encItemKey: 'qweqwe1',
          itemsKeyId: 'asdasd1',
          lastUserAgent: 'Brave',
          updatedAt: expect.any(Number),
          uuid: '1-2-3',
        },
      ],
      syncToken: 'MjoxNjE2MTY0NjMzLjI0MTU2OQ==',
    })
  })

  it('should calculate the sync token based on last updated date of saved items incremented with 1 microsecond to avoid returning same object in subsequent sync', async () => {
    itemRepository.findByUuidAndUserUuid = jest.fn().mockReturnValue(null)

    const itemHash3 = {
      uuid: '3-4-5',
      content: 'asdqwe3',
      content_type: ContentType.Note,
      duplicate_of: null,
      enc_item_key: 'qweqwe3',
      items_key_id: 'asdasd3',
      created_at: '2021-02-19T11:35:45.652Z',
      updated_at: '2021-03-25T09:37:37.943Z'
    } as jest.Mocked<ItemHash>

    const saveProcedureStartTimestamp = 1616164633241580
    const item1Timestamp = 1616164633241570
    const item2Timestamp = 1616164633241568
    const item3Timestamp = 1616164633241569
    timer.getTimestampInMicroseconds = jest.fn()
      .mockReturnValueOnce(saveProcedureStartTimestamp)
      .mockReturnValueOnce(item1Timestamp)
      .mockReturnValueOnce(item2Timestamp)
      .mockReturnValueOnce(item3Timestamp)

    const result = await createService().saveItems({
      itemHashes: [ itemHash1, itemHash3, itemHash2 ],
      userAgent: 'Brave',
      userUuid: '1-2-3'
    })

    expect(result.syncToken).toEqual('MjoxNjE2MTY0NjMzLjI0MTU3MQ==')
    expect(Buffer.from(result.syncToken, 'base64').toString('utf-8')).toEqual('2:1616164633.241571')
  })

  it('should update existing items', async () => {
    itemRepository.findByUuidAndUserUuid = jest.fn().mockReturnValue(item1)
    timer.convertStringDateToMicroseconds = jest.fn()
      .mockReturnValueOnce(dayjs.utc(itemHash1.updated_at).valueOf() * 1000)
      .mockReturnValueOnce(dayjs.utc(itemHash1.created_at).valueOf() * 1000)

    const result = await createService().saveItems({
      itemHashes: [ itemHash1 ],
      userAgent: 'Brave',
      userUuid: '1-2-3'
    })

    expect(result).toEqual({
      conflicts: [],
      savedItems: [
        {
          content: 'asdqwe1',
          contentType: 'Note',
          createdAt: expect.any(Number),
          encItemKey: 'qweqwe1',
          itemsKeyId: 'asdasd1',
          lastUserAgent: 'Brave',
          updatedAt: expect.any(Number),
          uuid: '1-2-3',
        },
      ],
      syncToken: 'MjoxNjE2MTY0NjMzLjI0MTU2OQ==',
    })
  })

  it('should mark existing item as deleted', async () => {
    itemRepository.findByUuidAndUserUuid = jest.fn().mockReturnValue(item1)
    timer.convertStringDateToMicroseconds = jest.fn()
      .mockReturnValueOnce(dayjs.utc(itemHash1.updated_at).valueOf() * 1000)
      .mockReturnValueOnce(dayjs.utc(itemHash1.created_at).valueOf() * 1000)

    itemHash1.deleted = true
    const result = await createService().saveItems({
      itemHashes: [ itemHash1 ],
      userAgent: 'Brave',
      userUuid: '1-2-3'
    })

    expect(result).toEqual({
      conflicts: [],
      savedItems: [
        {
          content: null,
          authHash: null,
          contentType: 'Note',
          createdAt: expect.any(Number),
          encItemKey: null,
          deleted: true,
          itemsKeyId: 'asdasd1',
          lastUserAgent: 'Brave',
          updatedAt: expect.any(Number),
          uuid: '1-2-3',
        },
      ],
      syncToken: 'MjoxNjE2MTY0NjMzLjI0MTU2OQ==',
    })
  })

  it('should mark existing item as duplicate', async () => {
    itemRepository.findByUuidAndUserUuid = jest.fn().mockReturnValue(item1)
    timer.convertStringDateToMicroseconds = jest.fn()
      .mockReturnValueOnce(dayjs.utc(itemHash1.updated_at).valueOf() * 1000)
      .mockReturnValueOnce(dayjs.utc(itemHash1.created_at).valueOf() * 1000)

    itemHash1.duplicate_of = '1-2-3'
    const result = await createService().saveItems({
      itemHashes: [ itemHash1 ],
      userAgent: 'Brave',
      userUuid: '1-2-3'
    })

    expect(result).toEqual({
      conflicts: [],
      savedItems: [
        {
          content: 'asdqwe1',
          contentType: 'Note',
          createdAt: expect.any(Number),
          encItemKey: 'qweqwe1',
          duplicateOf: '1-2-3',
          itemsKeyId: 'asdasd1',
          lastUserAgent: 'Brave',
          updatedAt: expect.any(Number),
          uuid: '1-2-3',
        },
      ],
      syncToken: 'MjoxNjE2MTY0NjMzLjI0MTU2OQ==',
    })
  })

  it('should skip sync conflicting items and mark them as sync conflicts when the incoming updated at time is too close to the stored value', async () => {
    itemRepository.findByUuidAndUserUuid = jest.fn()
      .mockReturnValueOnce(item1)
      .mockReturnValueOnce(item2)

    itemHash2.updated_at = '2021-03-19T14:37:13.942Z'

    timer.convertStringDateToMicroseconds = jest.fn()
      .mockReturnValueOnce(dayjs.utc(itemHash1.updated_at).valueOf() * 1000)
      .mockReturnValueOnce(dayjs.utc(itemHash1.created_at).valueOf() * 1000)
      .mockReturnValueOnce(dayjs.utc(itemHash2.updated_at).valueOf() * 1000)
      .mockReturnValueOnce(dayjs.utc(itemHash2.created_at).valueOf() * 1000)

    const result = await createService().saveItems({
      itemHashes: [ itemHash1, itemHash2 ],
      userAgent: 'Brave',
      userUuid: '1-2-3'
    })

    expect(result).toEqual({
      conflicts: [
        {
          type: 'sync_conflict',
          serverItem: item2
        }
      ],
      savedItems: [
        {
          content: 'asdqwe1',
          contentType: 'Note',
          createdAt: expect.any(Number),
          encItemKey: 'qweqwe1',
          itemsKeyId: 'asdasd1',
          lastUserAgent: 'Brave',
          updatedAt: expect.any(Number),
          uuid: '1-2-3',
        },
      ],
      syncToken: 'MjoxNjE2MTY0NjMzLjI0MTU2OQ==',
    })
  })

  it('should skip sync conflicting items and mark them as sync conflicts when the incoming updated at time is exactly the stored value', async () => {
    itemRepository.findByUuidAndUserUuid = jest.fn()
      .mockReturnValueOnce(item1)
      .mockReturnValueOnce(item2)

    item2.updatedAt = dayjs.utc('2021-03-19T14:37:13.942Z').valueOf() * Time.MicrosecondsInAMillisecond
    itemHash2.updated_at = '2021-03-19T14:37:13.942Z'

    timer.convertStringDateToMicroseconds = jest.fn()
      .mockReturnValueOnce(dayjs.utc(itemHash1.updated_at).valueOf() * 1000)
      .mockReturnValueOnce(dayjs.utc(itemHash1.created_at).valueOf() * 1000)
      .mockReturnValueOnce(dayjs.utc(itemHash2.updated_at).valueOf() * 1000)
      .mockReturnValueOnce(dayjs.utc(itemHash2.created_at).valueOf() * 1000)

    const result = await createService().saveItems({
      itemHashes: [ itemHash1, itemHash2 ],
      userAgent: 'Brave',
      userUuid: '1-2-3'
    })

    expect(result).toEqual({
      conflicts: [
        {
          type: 'sync_conflict',
          serverItem: item2
        }
      ],
      savedItems: [
        {
          content: 'asdqwe1',
          contentType: 'Note',
          createdAt: expect.any(Number),
          encItemKey: 'qweqwe1',
          itemsKeyId: 'asdasd1',
          lastUserAgent: 'Brave',
          updatedAt: expect.any(Number),
          uuid: '1-2-3',
        },
      ],
      syncToken: 'MjoxNjE2MTY0NjMzLjI0MTU2OQ==',
    })
  })

  it('should take server time when the incoming updated at time is not defined', async () => {
    itemRepository.findByUuidAndUserUuid = jest.fn()
      .mockReturnValueOnce(item1)
      .mockReturnValueOnce(item2)

    itemHash2.updated_at = undefined

    timer.convertStringDateToMicroseconds = jest.fn()
      .mockReturnValueOnce(dayjs.utc(itemHash1.updated_at).valueOf() * 1000)
      .mockReturnValueOnce(dayjs.utc(itemHash1.created_at).valueOf() * 1000)
      .mockReturnValueOnce(dayjs.utc(new Date(0).toString()).valueOf() * 1000)
      .mockReturnValueOnce(dayjs.utc(itemHash2.created_at).valueOf() * 1000)

    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(1616164634241568)

    const result = await createService().saveItems({
      itemHashes: [ itemHash1, itemHash2 ],
      userAgent: 'Brave',
      userUuid: '1-2-3'
    })

    expect(result).toEqual({
      conflicts: [],
      savedItems: [
        {
          content: 'asdqwe2',
          contentType: 'Note',
          createdAt: expect.any(Number),
          encItemKey: 'qweqwe2',
          itemsKeyId: 'asdasd2',
          lastUserAgent: 'Brave',
          updatedAt: expect.any(Number),
          uuid: '2-3-4',
        },
        {
          content: 'asdqwe1',
          contentType: 'Note',
          createdAt: expect.any(Number),
          encItemKey: 'qweqwe1',
          itemsKeyId: 'asdasd1',
          lastUserAgent: 'Brave',
          updatedAt: expect.any(Number),
          uuid: '1-2-3',
        }
      ],
      syncToken: 'MjoxNjE2MTY0NjM0LjI0MTU2OQ==',
    })
  })

  it('should skip saving conflicting items and mark them as sync conflicts when saving to database fails', async () => {
    itemRepository.findByUuidAndUserUuid = jest.fn().mockReturnValue(null)
    itemRepository.save = jest.fn().mockImplementation(() => {
      throw new Error('Something bad happened')
    })

    const result = await createService().saveItems({
      itemHashes: [ itemHash1, itemHash2 ],
      userAgent: 'Brave',
      userUuid: '1-2-3'
    })

    expect(result).toEqual({
      conflicts: [
        {
          type: 'uuid_conflict',
          unsavedItem: itemHash1
        },
        {
          type: 'uuid_conflict',
          unsavedItem: itemHash2
        }
      ],
      savedItems: [],
      syncToken: 'MjoxNjE2MTY0NjMzLjI0MTU2OQ==',
    })
  })
})
