import 'reflect-metadata'

import { DomainEventPublisherInterface, EmailBackupRequestedEvent, EmailBackupAttachmentCreatedEvent, MailBackupAttachmentTooBigEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { AuthHttpServiceInterface } from '../Auth/AuthHttpServiceInterface'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { Item } from '../Item/Item'
import { ItemBackupServiceInterface } from '../Item/ItemBackupServiceInterface'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { EmailBackupRequestedEventHandler } from './EmailBackupRequestedEventHandler'

describe('EmailBackupRequestedEventHandler', () => {
  let itemRepository: ItemRepositoryInterface
  let authHttpService: AuthHttpServiceInterface
  let itemBackupService: ItemBackupServiceInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  const emailAttachmentMaxByteSize = 100
  let item: Item
  let event: EmailBackupRequestedEvent
  let logger: Logger

  const createHandler = () => new EmailBackupRequestedEventHandler(
    itemRepository,
    authHttpService,
    itemBackupService,
    domainEventPublisher,
    domainEventFactory,
    emailAttachmentMaxByteSize,
    logger
  )

  beforeEach(() => {
    item = {} as jest.Mocked<Item>

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findAll = jest.fn().mockReturnValue([ item ])

    authHttpService = {} as jest.Mocked<AuthHttpServiceInterface>
    authHttpService.getUserKeyParams = jest.fn().mockReturnValue({ identifier: 'test@test.com' })

    event = {} as jest.Mocked<EmailBackupRequestedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      userUuid: '1-2-3',
      userHasEmailsMuted: false,
      muteEmailsSettingUuid: '1-2-3',
    }

    itemBackupService = {} as jest.Mocked<ItemBackupServiceInterface>
    itemBackupService.backup = jest.fn().mockReturnValue('backup-file-name')

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createEmailBackupAttachmentCreatedEvent = jest.fn().mockReturnValue({} as jest.Mocked<EmailBackupAttachmentCreatedEvent>)
    domainEventFactory.createMailBackupAttachmentTooBigEvent = jest.fn().mockReturnValue({} as jest.Mocked<MailBackupAttachmentTooBigEvent>)

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.warn = jest.fn()
  })

  it('should inform that backup attachment for email was created', async () => {
    await createHandler().handle(event)

    expect(domainEventPublisher.publish).toHaveBeenCalledTimes(1)
    expect(domainEventFactory.createEmailBackupAttachmentCreatedEvent).toHaveBeenCalledWith('backup-file-name', 'test@test.com')
  })

  it('should not inform that backup attachment for email was created if user key params cannot be obtained', async () => {
    authHttpService.getUserKeyParams = jest.fn().mockImplementation(() => {
      throw new Error('Oops!')
    })

    await createHandler().handle(event)

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
    expect(domainEventFactory.createEmailBackupAttachmentCreatedEvent).not.toHaveBeenCalled()
  })

  it('should not inform that backup attachment for email was created if backup file name is empty', async () => {
    itemBackupService.backup = jest.fn().mockReturnValue('')

    await createHandler().handle(event)

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
    expect(domainEventFactory.createEmailBackupAttachmentCreatedEvent).not.toHaveBeenCalled()
  })

  it('should inform that backup attachment for email was too big', async () => {
    item = {
      content: 'This content is too large so should not be sent',
    } as jest.Mocked<Item>
    itemRepository.findAll = jest.fn().mockReturnValue([ item ])

    await createHandler().handle(event)

    expect(domainEventPublisher.publish).toHaveBeenCalledTimes(1)
    expect(domainEventFactory.createMailBackupAttachmentTooBigEvent).toHaveBeenCalledWith({
      allowedSize: '100',
      attachmentSize: '118',
      email: 'test@test.com',
      muteEmailsSettingUuid: '1-2-3',
    })
    expect(domainEventFactory.createEmailBackupAttachmentCreatedEvent).not.toHaveBeenCalled()
  })

  it('should not inform that backup attachment for email was too big if mail notifications are muted', async () => {
    event.payload.userHasEmailsMuted = true
    item = {
      content: 'This content is too large so should not be sent',
    } as jest.Mocked<Item>
    itemRepository.findAll = jest.fn().mockReturnValue([ item ])

    await createHandler().handle(event)

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
    expect(domainEventFactory.createMailBackupAttachmentTooBigEvent).not.toHaveBeenCalled()
    expect(domainEventFactory.createEmailBackupAttachmentCreatedEvent).not.toHaveBeenCalled()
  })
})
