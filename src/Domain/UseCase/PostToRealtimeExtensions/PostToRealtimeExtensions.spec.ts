import 'reflect-metadata'

import { DomainEventFactoryInterface, DomainEventPublisherInterface, ItemsSyncedEvent } from '@standardnotes/domain-events'
import { ContentDecoderInterface } from '../../Item/ContentDecoderInterface'
import { ContentType } from '../../Item/ContentType'
import { Item } from '../../Item/Item'
import { ItemHash } from '../../Item/ItemHash'
import { ItemRepositoryInterface } from '../../Item/ItemRepositoryInterface'
import { PostToRealtimeExtensions } from './PostToRealtimeExtensions'

describe('PostToRealtimeExtensions', () => {
  let itemRepository: ItemRepositoryInterface
  let contentDecoder: ContentDecoderInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  let extension: Item
  let itemHash: ItemHash

  const createUseCase = () => new PostToRealtimeExtensions(
    itemRepository,
    contentDecoder,
    domainEventPublisher,
    domainEventFactory,
  )

  beforeEach(() => {
    extension = {
      uuid: '4-5-6',
      content: 'test',
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

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findAll = jest.fn().mockReturnValue([ extension ])

    contentDecoder = {} as jest.Mocked<ContentDecoderInterface>
    contentDecoder.decode = jest.fn().mockReturnValue({ frequency: 'realtime', url: 'http://test-server/extension1' })

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createItemsSyncedEvent = jest.fn().mockReturnValue({} as jest.Mocked<ItemsSyncedEvent>)
  })

  it('should post items realtime extensions', async () => {
    await createUseCase().execute({
      userUuid: '1-2-3',
      itemHashes: [ itemHash ],
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createItemsSyncedEvent).toHaveBeenCalledWith('1-2-3', 'http://test-server/extension1', '4-5-6', ['2-3-4'], true)
  })

  it('should skip extensions that are lacking content', async () => {
    extension.content = null
    await createUseCase().execute({
      userUuid: '1-2-3',
      itemHashes: [ itemHash ],
    })

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should skip extensions that are lacking frequency', async () => {
    contentDecoder.decode = jest.fn().mockReturnValue({ url: 'http://test-server/extension1' })
    await createUseCase().execute({
      userUuid: '1-2-3',
      itemHashes: [ itemHash ],
    })

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should skip extensions that are not realtime', async () => {
    contentDecoder.decode = jest.fn().mockReturnValue({ frequency: 'backup', url: 'http://test-server/extension1' })
    await createUseCase().execute({
      userUuid: '1-2-3',
      itemHashes: [ itemHash ],
    })

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })
})
