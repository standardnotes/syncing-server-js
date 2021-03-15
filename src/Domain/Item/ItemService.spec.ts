import dayjs = require('dayjs')
import 'reflect-metadata'
import { Item } from './Item'

import { ItemRepositoryInterface } from './ItemRepositoryInterface'
import { ItemService } from './ItemService'

describe('ItemService', () => {
  let itemRepository: ItemRepositoryInterface
  let item1: Item
  let item2: Item
  let syncToken: string

  const createService = () => new ItemService(itemRepository)

  beforeEach(() => {
    item1 = {} as jest.Mocked<Item>
    item2 = {
      updatedAt: new Date('2021-03-15 10:00:00')
    } as jest.Mocked<Item>

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findAll = jest.fn().mockReturnValue([item1, item2])

    const timestamp = +dayjs.utc('2021-03-15 07:00:00').toDate() / 1000
    syncToken = Buffer.from(`2:${timestamp}`, 'utf-8').toString('base64')
  })

  it('should retrieve all items for a user from last sync with sync token version 1', async () => {
    syncToken = Buffer.from('1:2021-03-15 07:00:00', 'utf-8').toString('base64')

    expect(
      await createService().getItems({
        userUuid: '1-2-3',
        syncToken,
        limit: 100,
        contentType: Item.CONTENT_TYPE_NOTE
      })
    ).toEqual({
      cursorToken: 'MjoxNjE1Nzk4ODAwMDAwLjAwMQ==',
      items: [ item1, item2 ]
    })

    expect(itemRepository.findAll).toHaveBeenCalledWith({
      contentType: 'Note',
      lastSyncTime: dayjs.utc('2021-03-15 07:00:00').toDate(),
      sortBy: 'updatedAt',
      userUuid: '1-2-3',
      limit: 100
    })
  })

  it('should retrieve all items for a user from last sync', async () => {
    expect(
      await createService().getItems({
        userUuid: '1-2-3',
        syncToken,
        limit: 100,
        contentType: Item.CONTENT_TYPE_NOTE
      })
    ).toEqual({
      cursorToken: 'MjoxNjE1Nzk4ODAwMDAwLjAwMQ==',
      items: [ item1, item2 ]
    })

    expect(itemRepository.findAll).toHaveBeenCalledWith({
      contentType: 'Note',
      lastSyncTime: dayjs.utc('2021-03-15 07:00:00').toDate(),
      sortBy: 'updatedAt',
      userUuid: '1-2-3',
      limit: 100
    })
  })

  it('should retrieve all items for a user from cursor token', async () => {
    const timestamp = +dayjs.utc('2020-03-12 07:00:00').toDate() / 1000
    const cursorToken = Buffer.from(`2:${timestamp}`, 'utf-8').toString('base64')

    expect(
      await createService().getItems({
        userUuid: '1-2-3',
        syncToken,
        cursorToken,
        limit: 100,
        contentType: Item.CONTENT_TYPE_NOTE
      })
    ).toEqual({
      cursorToken: 'MjoxNjE1Nzk4ODAwMDAwLjAwMQ==',
      items: [ item1, item2 ]
    })

    expect(itemRepository.findAll).toHaveBeenCalledWith({
      contentType: 'Note',
      lastSyncTime: dayjs.utc('2020-03-12 07:00:00').toDate(),
      sortBy: 'updatedAt',
      userUuid: '1-2-3',
      limit: 100
    })
  })

  it('should retrieve all undeleted items for a user without cursor or sync token', async () => {
    expect(
      await createService().getItems({
        userUuid: '1-2-3',
        limit: 100,
        contentType: Item.CONTENT_TYPE_NOTE
      })
    ).toEqual({
      cursorToken: 'MjoxNjE1Nzk4ODAwMDAwLjAwMQ==',
      items: [ item1, item2 ]
    })

    expect(itemRepository.findAll).toHaveBeenCalledWith({
      contentType: 'Note',
      deleted: false,
      sortBy: 'updatedAt',
      userUuid: '1-2-3',
      limit: 100
    })
  })

  it('should retrieve all items with default limit if not defined', async () => {
    await createService().getItems({
      userUuid: '1-2-3',
      syncToken,
      contentType: Item.CONTENT_TYPE_NOTE
    })

    expect(itemRepository.findAll).toHaveBeenCalledWith({
      contentType: 'Note',
      lastSyncTime: dayjs.utc('2021-03-15 07:00:00').toDate(),
      sortBy: 'updatedAt',
      userUuid: '1-2-3',
      limit: 100000
    })
  })

  it('should retrieve all items with non-positive limit if not defined', async () => {
    await createService().getItems({
      userUuid: '1-2-3',
      syncToken,
      limit: 0,
      contentType: Item.CONTENT_TYPE_NOTE
    })

    expect(itemRepository.findAll).toHaveBeenCalledWith({
      contentType: 'Note',
      lastSyncTime: dayjs.utc('2021-03-15 07:00:00').toDate(),
      sortBy: 'updatedAt',
      userUuid: '1-2-3',
      limit: 100000
    })
  })

  it('should throw an error if the sync token is missing time', async () => {
    let error = null

    try {
      await createService().getItems({
        userUuid: '1-2-3',
        syncToken: '2:',
        limit: 0,
        contentType: Item.CONTENT_TYPE_NOTE
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
        contentType: Item.CONTENT_TYPE_NOTE
      })
    } catch (e) {
      error = e
    }

    expect(error).not.toBeNull()
  })

  it('should have saving items not implemented yet', async () => {
    let error = null
    try {
      await createService().saveItems([], '', [])
    } catch (e) {
      error = e
    }

    expect(error.message).toEqual('Method not implemented.')
  })
})
