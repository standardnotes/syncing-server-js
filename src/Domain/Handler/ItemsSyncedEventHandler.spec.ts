import 'reflect-metadata'

import { ItemsSyncedEvent } from '@standardnotes/domain-events'
import { AuthHttpServiceInterface } from '../Auth/AuthHttpServiceInterface'
import { Item } from '../Item/Item'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { ItemsSyncedEventHandler } from './ItemsSyncedEventHandler'
import { ItemBackupServiceInterface } from '../Item/ItemBackupServiceInterface'
import { ExtensionsHttpServiceInterface } from '../Extension/ExtensionsHttpServiceInterface'

describe('ItemsSyncedEventHandler', () => {
  let itemRepository: ItemRepositoryInterface
  let authHttpService: AuthHttpServiceInterface
  let extensionsHttpService: ExtensionsHttpServiceInterface
  let itemBackupService: ItemBackupServiceInterface
  let internalDNSRerouteEnabled = false
  const extensionsServerUrl = 'https://extensions-server'
  let event: ItemsSyncedEvent
  let item: Item

  const createHandler = () => new ItemsSyncedEventHandler(
    itemRepository,
    authHttpService,
    extensionsHttpService,
    itemBackupService,
    internalDNSRerouteEnabled,
    extensionsServerUrl
  )

  beforeEach(() => {
    item = {} as jest.Mocked<Item>

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findAll = jest.fn().mockReturnValue([ item ])

    authHttpService = {} as jest.Mocked<AuthHttpServiceInterface>
    authHttpService.getUserKeyParams = jest.fn().mockReturnValue({ foo: 'bar' })

    extensionsHttpService = {} as jest.Mocked<ExtensionsHttpServiceInterface>
    extensionsHttpService.sendItemsToExtensionsServer = jest.fn()

    event = {} as jest.Mocked<ItemsSyncedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      userUuid: '1-2-3',
      extensionId: '2-3-4',
      extensionUrl: 'https://extensions-server/extension1',
      forceMute: false,
      itemUuids: [ '4-5-6' ],
    }

    itemBackupService = {} as jest.Mocked<ItemBackupServiceInterface>
    itemBackupService.backup = jest.fn().mockReturnValue('backup-file-name')
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

    expect(extensionsHttpService.sendItemsToExtensionsServer).toHaveBeenCalledWith({
      authParams: {
        foo: 'bar',
      },
      backupFilename: 'backup-file-name',
      extensionId: '2-3-4',
      extensionsServerUrl: 'https://extensions-server/extension1',
      forceMute: false,
      items: [ item ],
      userUuid: '1-2-3',
    })
  })

  it('should send all undeleted items to extensions server if none specified', async () => {
    event.payload.itemUuids = []

    await createHandler().handle(event)

    expect(itemRepository.findAll).toHaveBeenCalledWith({
      sortBy: 'updated_at_timestap',
      sortOrder: 'DESC',
      userUuid: '1-2-3',
      deleted: false,
    })

    expect(extensionsHttpService.sendItemsToExtensionsServer).toHaveBeenCalledWith({
      authParams: {
        foo: 'bar',
      },
      backupFilename: 'backup-file-name',
      extensionId: '2-3-4',
      extensionsServerUrl: 'https://extensions-server/extension1',
      forceMute: false,
      items: [ item ],
      userUuid: '1-2-3',
    })
  })

  it('should replace the Standard Notes extensions server url with internal URL if internal DNS reroute is enabled', async () => {
    internalDNSRerouteEnabled = true
    event.payload.extensionUrl = 'https://extensions.standardnotes.org/extension2',

    await createHandler().handle(event)

    expect(extensionsHttpService.sendItemsToExtensionsServer).toHaveBeenCalledWith({
      authParams: {
        foo: 'bar',
      },
      backupFilename: 'backup-file-name',
      extensionId: '2-3-4',
      extensionsServerUrl: 'https://extensions-server/extension2',
      forceMute: false,
      items: [ item ],
      userUuid: '1-2-3',
    })
  })
})
