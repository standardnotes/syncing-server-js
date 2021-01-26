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
      itemHashes: [ 'asdzxc123' ],
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
      ],
      syncToken: 'qwerty',
    })

    expect(itemService.getItems).toHaveBeenCalledWith('foo', 'bar', 10, 'Note')
    expect(itemService.saveItems).toHaveBeenCalledWith([ 'asdzxc123' ], 'Google Chrome', [ item1 ])
  })
})
