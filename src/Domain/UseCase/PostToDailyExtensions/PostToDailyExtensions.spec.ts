import 'reflect-metadata'

import { DomainEventPublisherInterface, EmailArchiveExtensionSyncedEvent, ItemsSyncedEvent } from '@standardnotes/domain-events'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { ContentDecoderInterface } from '../../Item/ContentDecoderInterface'
import { Item } from '../../Item/Item'
import { PostToDailyExtensions } from './PostToDailyExtensions'
import { ContentType } from '../../Item/ContentType'
import { Logger } from 'winston'

describe('PostToDailyExtensions', () => {
  let contentDecoder: ContentDecoderInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  let dailyExtension: Item
  let realtimeExtension: Item
  let emailArchiveExtension: Item
  let regularItem: Item
  let deletedDailyExtension: Item
  let noUrlDailyExtension: Item
  let logger: Logger

  const createUseCase = () => new PostToDailyExtensions(
    contentDecoder,
    domainEventPublisher,
    domainEventFactory,
    logger
  )

  beforeEach(() => {
    contentDecoder = {} as jest.Mocked<ContentDecoderInterface>
    contentDecoder.decode = jest.fn()

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createItemsSyncedEvent = jest.fn().mockReturnValue({} as jest.Mocked<ItemsSyncedEvent>)
    domainEventFactory.createEmailArchiveExtensionSyncedEvent = jest.fn().mockReturnValue({} as jest.Mocked<EmailArchiveExtensionSyncedEvent>)

    dailyExtension = {
      uuid: '1-2-3',
      contentType: ContentType.ServerExtension,
      deleted: false,
    } as jest.Mocked<Item>

    realtimeExtension = {
      uuid: '2-3-4',
      contentType: ContentType.ServerExtension,
      deleted: false,
    } as jest.Mocked<Item>

    regularItem = {
      uuid: '3-4-5',
      contentType: ContentType.Note,
      deleted: false,
    } as jest.Mocked<Item>

    deletedDailyExtension = {
      uuid: '4-5-6',
      contentType: ContentType.ServerExtension,
      deleted: true,
    } as jest.Mocked<Item>

    emailArchiveExtension = {
      uuid: '5-6-7',
      contentType: ContentType.ServerExtension,
      deleted: false,
    } as jest.Mocked<Item>

    noUrlDailyExtension = {
      uuid: '6-7-8',
      contentType: ContentType.ServerExtension,
      deleted: false,
    } as jest.Mocked<Item>

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
  })

  it('should trigger extensions with daily frequency', async () => {
    contentDecoder.decode = jest.fn()
      .mockReturnValueOnce({ frequency: 'daily', url: 'http://test-server/extension1' })
      .mockReturnValueOnce({ frequency: 'realtime', url: 'http://test-server/extension2' })
      .mockReturnValueOnce({ frequency: 'daily', url: 'http://test-server/extension1' })

    await createUseCase().execute({
      userUuid: '1-2-3',
      extensions: [ dailyExtension, realtimeExtension, deletedDailyExtension, regularItem ],
    })

    expect(domainEventPublisher.publish).toHaveBeenCalledTimes(1)
    expect(domainEventFactory.createItemsSyncedEvent).toHaveBeenCalledWith({
      userUuid: '1-2-3',
      extensionUrl: 'http://test-server/extension1',
      extensionId: '1-2-3',
      itemUuids: [],
      forceMute: false,
      skipFileBackup: false,
    })
  })

  it('should trigger email archive extension', async () => {
    contentDecoder.decode = jest.fn()
      .mockReturnValueOnce({ frequency: 'daily', url: 'http://test-server/extension1', subtype: 'backup.email_archive' })
      .mockReturnValueOnce({ frequency: 'realtime', url: 'http://test-server/extension2' })
      .mockReturnValueOnce({ frequency: 'daily' })
      .mockReturnValueOnce({ frequency: 'daily', url: 'http://test-server/extension1', subtype: 'backup.email_archive' })
      .mockReturnValueOnce({ frequency: 'daily' })

    await createUseCase().execute({
      userUuid: '1-2-3',
      extensions: [ emailArchiveExtension, realtimeExtension, noUrlDailyExtension ],
    })

    expect(domainEventPublisher.publish).toHaveBeenCalledTimes(1)
    expect(domainEventFactory.createEmailArchiveExtensionSyncedEvent).toHaveBeenCalledWith('1-2-3', '5-6-7')
  })
})
