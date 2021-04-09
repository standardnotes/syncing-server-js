import 'reflect-metadata'

import { KeyParams } from '@standardnotes/auth'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { SuperAgentRequest, SuperAgentStatic } from 'superagent'
import { Logger } from 'winston'
import { ExtensionSetting } from '../ExtensionSetting/ExtensionSetting'
import { ExtensionSettingRepositoryInterface } from '../ExtensionSetting/ExtensionSettingRepositoryInterface'
import { ContentDecoderInterface } from '../Item/ContentDecoderInterface'
import { Item } from '../Item/Item'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { ExtensionsHttpService } from './ExtensionsHttpService'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'

describe('ExtensionsHttpService', () => {
  let httpClient: SuperAgentStatic
  let request: SuperAgentRequest
  let extensionSetting: ExtensionSetting
  let extensionSettingRepository: ExtensionSettingRepositoryInterface
  let itemRepository: ItemRepositoryInterface
  let contentDecoder: ContentDecoderInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  let item: Item
  let authParams: KeyParams
  let logger: Logger

  const createService = () => new ExtensionsHttpService(
    httpClient,
    extensionSettingRepository,
    itemRepository,
    contentDecoder,
    domainEventPublisher,
    domainEventFactory,
    logger
  )

  beforeEach(() => {
    request = {} as jest.Mocked<SuperAgentRequest>
    request.set = jest.fn().mockReturnThis()
    request.send = jest.fn().mockReturnThis()

    httpClient = {} as jest.Mocked<SuperAgentStatic>
    httpClient.post = jest.fn().mockReturnValue(request)

    item = {
      content: 'test',
    } as jest.Mocked<Item>

    authParams = {} as jest.Mocked<KeyParams>

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findByUuidAndUserUuid = jest.fn().mockReturnValue(item)

    extensionSetting = {
      muteEmails: false,
      uuid: '3-4-5',
    } as jest.Mocked<ExtensionSetting>

    extensionSettingRepository = {} as jest.Mocked<ExtensionSettingRepositoryInterface>
    extensionSettingRepository.findOneByExtensionId = jest.fn().mockReturnValue(extensionSetting)
    extensionSettingRepository.save = jest.fn().mockImplementation(input => input)

    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createDropboxBackupFailedEvent = jest.fn()
    domainEventFactory.createGoogleDriveBackupFailedEvent = jest.fn()
    domainEventFactory.createOneDriveBackupFailedEvent = jest.fn()

    contentDecoder = {} as jest.Mocked<ContentDecoderInterface>
    contentDecoder.decode = jest.fn().mockReturnValue({ name: 'Dropbox' })
  })

  it('should send items to extensions server', async () => {
    await createService().sendItemsToExtensionsServer({
      userUuid: '1-2-3',
      extensionId: '2-3-4',
      extensionsServerUrl: 'https://extensions-server/extension1',
      forceMute: false,
      items: [ item ],
      backupFilename: 'backup-file',
      authParams,
    })

    expect(httpClient.post).toHaveBeenCalledWith('https://extensions-server/extension1')
    expect(request.send).toHaveBeenCalledWith({
      auth_params: authParams,
      backup_filename: 'backup-file',
      items: [ item ],
      settings_id: '3-4-5',
      silent: false,
      user_uuid: '1-2-3',
    })
  })

  it('should create a new extension setting if one does not exist', async () => {
    extensionSettingRepository.findOneByExtensionId = jest.fn().mockReturnValue(undefined)

    await createService().sendItemsToExtensionsServer({
      userUuid: '1-2-3',
      extensionId: '2-3-4',
      extensionsServerUrl: 'https://extensions-server/extension1',
      forceMute: false,
      items: [ item ],
      backupFilename: 'backup-file',
      authParams,
    })

    expect(extensionSettingRepository.save).toHaveBeenCalledWith({
      extensionId: '2-3-4',
      muteEmails: false,
    })
  })

  it('should publish a failed Dropbox backup event if request was not sent successfully', async () => {
    contentDecoder.decode = jest.fn().mockReturnValue({ name: 'Dropbox' })

    request.send = jest.fn().mockImplementation(() => {
      throw new Error('Could not reach the extensions server')
    })
    httpClient.post = jest.fn().mockReturnValue(request)

    await createService().sendItemsToExtensionsServer({
      userUuid: '1-2-3',
      extensionId: '2-3-4',
      extensionsServerUrl: 'https://extensions-server/extension1',
      forceMute: false,
      items: [ item ],
      backupFilename: 'backup-file',
      authParams,
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createDropboxBackupFailedEvent).toHaveBeenCalled()
  })

  it('should publish a failed Google Drive backup event if request was not sent successfully', async () => {
    contentDecoder.decode = jest.fn().mockReturnValue({ name: 'Google Drive' })

    request.send = jest.fn().mockImplementation(() => {
      throw new Error('Could not reach the extensions server')
    })
    httpClient.post = jest.fn().mockReturnValue(request)

    await createService().sendItemsToExtensionsServer({
      userUuid: '1-2-3',
      extensionId: '2-3-4',
      extensionsServerUrl: 'https://extensions-server/extension1',
      forceMute: false,
      items: [ item ],
      backupFilename: 'backup-file',
      authParams,
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createGoogleDriveBackupFailedEvent).toHaveBeenCalled()
  })

  it('should publish a failed One Drive backup event if request was not sent successfully', async () => {
    contentDecoder.decode = jest.fn().mockReturnValue({ name: 'OneDrive' })

    request.send = jest.fn().mockImplementation(() => {
      throw new Error('Could not reach the extensions server')
    })
    httpClient.post = jest.fn().mockReturnValue(request)

    await createService().sendItemsToExtensionsServer({
      userUuid: '1-2-3',
      extensionId: '2-3-4',
      extensionsServerUrl: 'https://extensions-server/extension1',
      forceMute: false,
      items: [ item ],
      backupFilename: 'backup-file',
      authParams,
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createOneDriveBackupFailedEvent).toHaveBeenCalled()
  })

  it('should not publish a failed backup event if emailes are force muted', async () => {
    contentDecoder.decode = jest.fn().mockReturnValue({ name: 'OneDrive' })

    request.send = jest.fn().mockImplementation(() => {
      throw new Error('Could not reach the extensions server')
    })
    httpClient.post = jest.fn().mockReturnValue(request)

    await createService().sendItemsToExtensionsServer({
      userUuid: '1-2-3',
      extensionId: '2-3-4',
      extensionsServerUrl: 'https://extensions-server/extension1',
      forceMute: true,
      items: [ item ],
      backupFilename: 'backup-file',
      authParams,
    })

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should throw an error if the extension to post to is not found', async () => {
    itemRepository.findByUuidAndUserUuid = jest.fn().mockReturnValue(undefined)

    request.send = jest.fn().mockImplementation(() => {
      throw new Error('Could not reach the extensions server')
    })
    httpClient.post = jest.fn().mockReturnValue(request)

    let error = null
    try {
      await createService().sendItemsToExtensionsServer({
        userUuid: '1-2-3',
        extensionId: '2-3-4',
        extensionsServerUrl: 'https://extensions-server/extension1',
        forceMute: false,
        items: [ item ],
        backupFilename: 'backup-file',
        authParams,
      })
    } catch (e) {
      error = e
    }

    expect(error).not.toBeNull()
  })

  it('should throw an error if the extension to post to has no content', async () => {
    item = {} as jest.Mocked<Item>
    itemRepository.findByUuidAndUserUuid = jest.fn().mockReturnValue(item)

    request.send = jest.fn().mockImplementation(() => {
      throw new Error('Could not reach the extensions server')
    })
    httpClient.post = jest.fn().mockReturnValue(request)

    let error = null
    try {
      await createService().sendItemsToExtensionsServer({
        userUuid: '1-2-3',
        extensionId: '2-3-4',
        extensionsServerUrl: 'https://extensions-server/extension1',
        forceMute: false,
        items: [ item ],
        backupFilename: 'backup-file',
        authParams,
      })
    } catch (e) {
      error = e
    }

    expect(error).not.toBeNull()
  })

  it('should publish a failed Dropbox backup event judging by extension url if request was not sent successfully', async () => {
    contentDecoder.decode = jest.fn().mockReturnValue({ url: 'https://dbt.com/...' })

    request.send = jest.fn().mockImplementation(() => {
      throw new Error('Could not reach the extensions server')
    })
    httpClient.post = jest.fn().mockReturnValue(request)

    await createService().sendItemsToExtensionsServer({
      userUuid: '1-2-3',
      extensionId: '2-3-4',
      extensionsServerUrl: 'https://extensions-server/extension1',
      forceMute: false,
      items: [ item ],
      backupFilename: 'backup-file',
      authParams,
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createDropboxBackupFailedEvent).toHaveBeenCalled()
  })

  it('should publish a failed Google Drive backup event judging by extension url if request was not sent successfully', async () => {
    contentDecoder.decode = jest.fn().mockReturnValue({ url: 'https://gdrive.com/...' })

    request.send = jest.fn().mockImplementation(() => {
      throw new Error('Could not reach the extensions server')
    })
    httpClient.post = jest.fn().mockReturnValue(request)

    await createService().sendItemsToExtensionsServer({
      userUuid: '1-2-3',
      extensionId: '2-3-4',
      extensionsServerUrl: 'https://extensions-server/extension1',
      forceMute: false,
      items: [ item ],
      backupFilename: 'backup-file',
      authParams,
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createGoogleDriveBackupFailedEvent).toHaveBeenCalled()
  })

  it('should publish a failed One Drive backup event judging by extension url if request was not sent successfully', async () => {
    contentDecoder.decode = jest.fn().mockReturnValue({ url: 'https://onedrive.com/...' })

    request.send = jest.fn().mockImplementation(() => {
      throw new Error('Could not reach the extensions server')
    })
    httpClient.post = jest.fn().mockReturnValue(request)

    await createService().sendItemsToExtensionsServer({
      userUuid: '1-2-3',
      extensionId: '2-3-4',
      extensionsServerUrl: 'https://extensions-server/extension1',
      forceMute: false,
      items: [ item ],
      backupFilename: 'backup-file',
      authParams,
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createOneDriveBackupFailedEvent).toHaveBeenCalled()
  })

  it('should throw an error if cannot deduce extension by judging from the url', async () => {
    contentDecoder.decode = jest.fn().mockReturnValue({ url: 'https://foobar.com/...' })

    request.send = jest.fn().mockImplementation(() => {
      throw new Error('Could not reach the extensions server')
    })
    httpClient.post = jest.fn().mockReturnValue(request)

    let error = null
    try {
      await createService().sendItemsToExtensionsServer({
        userUuid: '1-2-3',
        extensionId: '2-3-4',
        extensionsServerUrl: 'https://extensions-server/extension1',
        forceMute: false,
        items: [ item ],
        backupFilename: 'backup-file',
        authParams,
      })
    } catch (e) {
      error = e
    }

    expect(error).not.toBeNull()
  })

  it('should throw an error if there is no extension name or url', async () => {
    contentDecoder.decode = jest.fn().mockReturnValue({})

    request.send = jest.fn().mockImplementation(() => {
      throw new Error('Could not reach the extensions server')
    })
    httpClient.post = jest.fn().mockReturnValue(request)

    let error = null
    try {
      await createService().sendItemsToExtensionsServer({
        userUuid: '1-2-3',
        extensionId: '2-3-4',
        extensionsServerUrl: 'https://extensions-server/extension1',
        forceMute: false,
        items: [ item ],
        backupFilename: 'backup-file',
        authParams,
      })
    } catch (e) {
      error = e
    }

    expect(error).not.toBeNull()
  })
})
