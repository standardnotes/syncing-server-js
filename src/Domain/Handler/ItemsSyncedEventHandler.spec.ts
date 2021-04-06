import 'reflect-metadata'

import { S3 } from 'aws-sdk'
import { ItemsSyncedEvent } from '@standardnotes/domain-events'
import { SuperAgentRequest, SuperAgentStatic } from 'superagent'
import { AuthHttpServiceInterface } from '../Auth/AuthHttpServiceInterface'
import { ExtensionSetting } from '../ExtensionSetting/ExtensionSetting'
import { ExtensionSettingRepositoryInterface } from '../ExtensionSetting/ExtensionSettingRepositoryInterface'
import { Item } from '../Item/Item'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { ItemsSyncedEventHandler } from './ItemsSyncedEventHandler'

describe('ItemsSyncedEventHandler', () => {
  let httpClient: SuperAgentStatic
  let request: SuperAgentRequest
  let itemRepository: ItemRepositoryInterface
  let authHttpService: AuthHttpServiceInterface
  let extensionSetting: ExtensionSetting
  let s3Client: S3
  const s3BackupBucketName = 'TempBucket'
  let extensionSettingRepository: ExtensionSettingRepositoryInterface
  let internalDNSRerouteEnabled = false
  let extensionsServerUrl = 'https://extensions-server'
  let event: ItemsSyncedEvent
  let item: Item

  const createHandler = () => new ItemsSyncedEventHandler(
    httpClient,
    itemRepository,
    authHttpService,
    extensionSettingRepository,
    s3Client,
    s3BackupBucketName,
    internalDNSRerouteEnabled,
    extensionsServerUrl,
  )

  beforeEach(() => {
    request = {} as jest.Mocked<SuperAgentRequest>
    request.set = jest.fn().mockReturnThis()
    request.send = jest.fn().mockReturnThis()

    httpClient = {} as jest.Mocked<SuperAgentStatic>
    httpClient.post = jest.fn().mockReturnValue(request)

    item = {} as jest.Mocked<Item>

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findAll = jest.fn().mockReturnValue([ item ])

    authHttpService = {} as jest.Mocked<AuthHttpServiceInterface>
    authHttpService.getUserKeyParams = jest.fn().mockReturnValue({ foo: 'bar' })

    extensionSetting = {
      muteEmails: false,
      uuid: '3-4-5',
    } as jest.Mocked<ExtensionSetting>

    extensionSettingRepository = {} as jest.Mocked<ExtensionSettingRepositoryInterface>
    extensionSettingRepository.findOneByExtensionId = jest.fn().mockReturnValue(extensionSetting)
    extensionSettingRepository.save = jest.fn().mockImplementation(input => input)

    event = {} as jest.Mocked<ItemsSyncedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      userUuid: '1-2-3',
      extensionId: '2-3-4',
      extensionUrl: 'https://extensions-server/extension1',
      forceMute: false,
      itemUuids: [ '4-5-6' ],
    }

    s3Client = {} as jest.Mocked<S3>
    s3Client.upload = jest.fn()
  })

  it('should send synced items to extensions server', async () => {
    await createHandler().handle(event)

    expect(itemRepository.findAll).toHaveBeenCalledWith({
      sortBy: 'updated_at_timestap',
      sortOrder: 'DESC',
      userUuid: '1-2-3',
      uuids:  [
        '4-5-6',
      ],
    })

    expect(httpClient.post).toHaveBeenCalledWith('https://extensions-server/extension1')
    expect(request.send).toHaveBeenCalledWith({
      auth_params: {
        foo: 'bar',
      },
      backup_filename: expect.any(String),
      items: [ item ],
      settings_id: '3-4-5',
      silent: false,
      user_uuid: '1-2-3',
    })
    expect(s3Client.upload).toHaveBeenCalledWith({
      Body: '{"items":[{}],"auth_params":{"foo":"bar"}}',
      Bucket: 'TempBucket',
      Key: expect.any(String),
    })
  })

  it('should send synced items to extensions server with instruction to mute emails', async () => {
    event.payload.forceMute = true
    await createHandler().handle(event)

    expect(request.send).toHaveBeenCalledWith({
      auth_params: {
        foo: 'bar',
      },
      backup_filename: expect.any(String),
      items: [ item ],
      settings_id: '3-4-5',
      silent: true,
      user_uuid: '1-2-3',
    })
  })

  it('should replace the extensions server url from event with internal DNS reroute', async () => {
    internalDNSRerouteEnabled = true
    extensionsServerUrl = 'https://internal-extensions-server'
    event.payload.extensionUrl = 'https://extensions.standardnotes.org/extension1'

    await createHandler().handle(event)

    expect(httpClient.post).toHaveBeenCalledWith('https://internal-extensions-server/extension1')
  })

  it('should send all undeleted items if none are specified', async () => {
    event.payload.itemUuids = []
    await createHandler().handle(event)

    expect(itemRepository.findAll).toHaveBeenCalledWith({
      sortBy: 'updated_at_timestap',
      sortOrder: 'DESC',
      userUuid: '1-2-3',
      deleted: false,
    })

    expect(request.send).toHaveBeenCalledWith({
      auth_params: {
        foo: 'bar',
      },
      backup_filename: expect.any(String),
      items: [ item ],
      settings_id: '3-4-5',
      silent: false,
      user_uuid: '1-2-3',
    })
  })

  it('should create an extension setting if none is found', async () => {
    extensionSettingRepository.findOneByExtensionId = jest.fn().mockReturnValue(undefined)

    await createHandler().handle(event)

    expect(extensionSettingRepository.save).toHaveBeenCalledWith({
      extensionId: '2-3-4',
      muteEmails: false,
    })

    expect(httpClient.post).toHaveBeenCalled()
    expect(request.send).toHaveBeenCalled()
  })
})
