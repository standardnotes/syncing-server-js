import 'reflect-metadata'

import { AccountDeletionRequestedEvent, DomainEventInterface, DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { Item } from '../Item/Item'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { AccountDeletionRequestedEventHandler } from './AccountDeletionRequestedEventHandler'
import { ContentDecoderInterface } from '../Item/ContentDecoderInterface'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { RevisionServiceInterface } from '../Revision/RevisionServiceInterface'

describe('AccountDeletionRequestedEventHandler', () => {
  let itemRepository: ItemRepositoryInterface
  let revisionService: RevisionServiceInterface
  let contentDecoder: ContentDecoderInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  let logger: Logger
  let event: AccountDeletionRequestedEvent
  let item: Item

  const createHandler = () => new AccountDeletionRequestedEventHandler(
    itemRepository,
    revisionService,
    contentDecoder,
    domainEventPublisher,
    domainEventFactory,
    logger
  )

  beforeEach(() => {
    item = {
      uuid: '1-2-3',
      content: 'test',
    } as jest.Mocked<Item>

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findAll = jest.fn().mockReturnValue([ item ])
    itemRepository.remove = jest.fn()

    revisionService = {} as jest.Mocked<RevisionServiceInterface>
    revisionService.deleteRevisionsForItem = jest.fn()

    contentDecoder = {} as jest.Mocked<ContentDecoderInterface>
    contentDecoder.decode = jest.fn().mockReturnValue({ frequency: 'realtime', url: 'http://test-url/extension1' })

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createItemsSyncedEvent = jest.fn().mockReturnValue({} as jest.Mocked<DomainEventInterface>)

    logger = {} as jest.Mocked<Logger>
    logger.info = jest.fn()

    event = {} as jest.Mocked<AccountDeletionRequestedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      userUuid: '2-3-4',
    }
  })

  it('should sync all extensions removal for a user', async () => {
    await createHandler().handle(event)

    expect(domainEventPublisher.publish).toHaveBeenCalledTimes(1)
    expect(domainEventFactory.createItemsSyncedEvent).toHaveBeenCalledWith({
      extensionId: '1-2-3',
      extensionUrl: 'http://test-url/extension1&directive=delete-account',
      forceMute: true,
      itemUuids: [],
      userUuid: '2-3-4',
    })
  })

  it('should not sync extensions removal for non-realtime extensions', async () => {
    contentDecoder.decode = jest.fn().mockReturnValue({ frequency: 'daily', url: 'http://test-url/extension1' })

    await createHandler().handle(event)

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should not sync extensions removal for extensions missing content', async () => {
    item.content = null

    await createHandler().handle(event)

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should remove all items and revision for a user', async () => {
    await createHandler().handle(event)

    expect(revisionService.deleteRevisionsForItem).toHaveBeenCalledWith(item)
    expect(itemRepository.remove).toHaveBeenCalledWith(item)
  })
})
