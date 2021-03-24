import 'reflect-metadata'
import { Item } from '../Item/Item'
import { ItemServiceInterface } from '../Item/ItemServiceInterface'

import { SyncItems } from './SyncItems'

describe('SyncItems', () => {
  let itemService: ItemServiceInterface
  let item1: Item
  let item2: Item

  const createUseCase = () => new SyncItems(itemService)

  beforeEach(() => {
    item1 = {} as jest.Mocked<Item>

    item2 = {} as jest.Mocked<Item>

    itemService = {} as jest.Mocked<ItemServiceInterface>
    itemService.getItems = jest.fn().mockReturnValue({
      items: [ item1 ],
      cursorToken: 'asdzxc'
    })
    itemService.saveItems = jest.fn().mockReturnValue({
      items: [ item2 ],
      conflicts: [],
      syncToken: 'qwerty'
    })
  })

  it('should sync items', async() => {
    expect(await createUseCase().execute({
      userUuid: '1-2-3',
      itemHashes: [
        {
          uuid: '2-3-4'
        }
      ],
      syncToken: 'foo',
      cursorToken: 'bar',
      limit: 10,
      userAgent: 'Google Chrome',
      contentType: 'Note'
    })).toEqual({
      conflicts: [],
      cursorToken: 'asdzxc',
      retrievedItems: [
        item1,
      ],
      savedItems: [
        item2,
      ]
    })

    expect(itemService.getItems).toHaveBeenCalledWith({
      contentType: 'Note',
      cursorToken: 'bar',
      limit: 10,
      syncToken: 'foo',
      userUuid: '1-2-3'
    })
    expect(itemService.saveItems).toHaveBeenCalledWith([ 'asdzxc123' ], 'Google Chrome', [ item1 ])
  })
})
