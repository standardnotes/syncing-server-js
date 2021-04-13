import 'reflect-metadata'

import { DuplicateItemSyncedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { Item } from '../Item/Item'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { Revision } from '../Revision/Revision'
import { DuplicateItemSyncedEventHandler } from './DuplicateItemSyncedEventHandler'

describe('DuplicateItemSyncedEventHandler', () => {
  let itemRepository: ItemRepositoryInterface
  let logger: Logger
  let duplicateItem: Item
  let originalItem: Item
  let revision1: Revision
  let revision2: Revision
  let revision3: Revision
  let event: DuplicateItemSyncedEvent

  const createHandler = () => new DuplicateItemSyncedEventHandler(itemRepository, logger)

  beforeEach(() => {
    revision1 = {} as jest.Mocked<Revision>

    revision2 = {} as jest.Mocked<Revision>

    revision3 = {} as jest.Mocked<Revision>

    originalItem = {
      revisions: Promise.resolve([revision1, revision2]),
      uuid: '1-2-3',
    } as jest.Mocked<Item>

    duplicateItem = {
      uuid: '2-3-4',
      duplicateOf: '1-2-3',
      revisions: Promise.resolve([revision3]),
    } as jest.Mocked<Item>

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findByUuidAndUserUuid = jest.fn()
      .mockReturnValueOnce(duplicateItem)
      .mockReturnValueOnce(originalItem)
    itemRepository.save = jest.fn()

    logger = {} as jest.Mocked<Logger>
    logger.warn = jest.fn()

    event = {} as jest.Mocked<DuplicateItemSyncedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      userUuid: '1-2-3',
      itemUuid: '2-3-4',
    }
  })

  it('should copy revisions from original item to the duplicate item', async () => {
    await createHandler().handle(event)

    expect(itemRepository.save).toHaveBeenCalledWith({
      duplicateOf: '1-2-3',
      uuid: '2-3-4',
      revisions: Promise.resolve([ revision1, revision2, revision3 ]),
    })
  })

  it('should not copy revisions if original item does not exist', async () => {
    itemRepository.findByUuidAndUserUuid = jest.fn()
      .mockReturnValueOnce(duplicateItem)
      .mockReturnValueOnce(undefined)

    await createHandler().handle(event)

    expect(itemRepository.save).not.toHaveBeenCalled()
  })

  it('should not copy revisions if duplicate item does not exist', async () => {
    itemRepository.findByUuidAndUserUuid = jest.fn()
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(originalItem)

    await createHandler().handle(event)

    expect(itemRepository.save).not.toHaveBeenCalled()
  })

  it('should not copy revisions if duplicate item is not pointing to duplicate anything', async () => {
    duplicateItem.duplicateOf = null
    await createHandler().handle(event)

    expect(itemRepository.save).not.toHaveBeenCalled()
  })
})
