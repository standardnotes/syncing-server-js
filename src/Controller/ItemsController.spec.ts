import 'reflect-metadata'

import * as express from 'express'
import { ContentType } from '@standardnotes/common'

import { ItemsController } from './ItemsController'
import { results } from 'inversify-express-utils'
import { SyncItems } from '../Domain/UseCase/SyncItems'
import { ApiVersion } from '../Domain/Api/ApiVersion'
import { PostToRealtimeExtensions } from '../Domain/UseCase/PostToRealtimeExtensions/PostToRealtimeExtensions'
import { SyncResponseFactoryResolverInterface } from '../Domain/Item/SyncResponse/SyncResponseFactoryResolverInterface'
import { SyncResponseFactoryInterface } from '../Domain/Item/SyncResponse/SyncResponseFactoryInterface'
import { SyncResponse20200115 } from '../Domain/Item/SyncResponse/SyncResponse20200115'
import { PostToDailyExtensions } from '../Domain/UseCase/PostToDailyExtensions/PostToDailyExtensions'
import { Logger } from 'winston'
import { ItemRepositoryInterface } from '../Domain/Item/ItemRepositoryInterface'
import { Item } from '../Domain/Item/Item'
import { ContentDecoderInterface } from '../Domain/Item/ContentDecoderInterface'

describe('ItemsController', () => {
  let syncItems: SyncItems
  let postToRealtimeExtensions: PostToRealtimeExtensions
  let request: express.Request
  let response: express.Response
  let syncResponceFactoryResolver: SyncResponseFactoryResolverInterface
  let syncResponseFactory: SyncResponseFactoryInterface
  let syncResponse: SyncResponse20200115
  let postToDailyExtensions: PostToDailyExtensions
  let itemRepository: ItemRepositoryInterface
  let contentDecoder: ContentDecoderInterface
  let logger: Logger

  const createController = () => new ItemsController(
    syncItems,
    syncResponceFactoryResolver,
    postToRealtimeExtensions,
    postToDailyExtensions,
    itemRepository,
    contentDecoder,
    logger
  )

  beforeEach(() => {
    syncItems = {} as jest.Mocked<SyncItems>
    syncItems.execute = jest.fn().mockReturnValue({ foo: 'bar' })

    postToRealtimeExtensions = {} as jest.Mocked<PostToRealtimeExtensions>
    postToRealtimeExtensions.execute = jest.fn()

    postToDailyExtensions = {} as jest.Mocked<PostToDailyExtensions>
    postToDailyExtensions.execute = jest.fn()

    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()

    request = {
      headers: {},
      body: {},
      params: {},
    } as jest.Mocked<express.Request>

    request.body.api = ApiVersion.v20200115
    request.body.sync_token = 'MjoxNjE3MTk1MzQyLjc1ODEyMTc='
    request.body.limit = 150
    request.body.compute_integrity = false
    request.headers['user-agent'] = 'Google Chrome'
    request.body.items = [
      {
        content: 'test',
        content_type: ContentType.Note,
        created_at: '2021-02-19T11:35:45.655Z',
        deleted: false,
        duplicate_of: null,
        enc_item_key: 'test',
        items_key_id: 'test',
        updated_at: '2021-02-19T11:35:45.655Z',
        uuid: '1-2-3',
      },
    ]

    response = {
      locals: {},
    } as jest.Mocked<express.Response>
    response.locals.user = {
      uuid: '123',
    }

    syncResponse = {
      integrity_hash: '123',
    } as jest.Mocked<SyncResponse20200115>

    syncResponseFactory = {} as jest.Mocked<SyncResponseFactoryInterface>
    syncResponseFactory.createResponse = jest.fn().mockReturnValue(syncResponse)

    syncResponceFactoryResolver = {} as jest.Mocked<SyncResponseFactoryResolverInterface>
    syncResponceFactoryResolver.resolveSyncResponseFactoryVersion = jest.fn().mockReturnValue(syncResponseFactory)

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findMFAExtensionByUserUuid = jest.fn()

    contentDecoder = {} as jest.Mocked<ContentDecoderInterface>
    contentDecoder.decode = jest.fn().mockReturnValue({
      secret: 'foo',
    })
  })

  it('should sync items', async () => {
    const httpResponse = <results.JsonResult> await createController().sync(request, response)
    const result = await httpResponse.executeAsync()

    expect(syncItems.execute).toHaveBeenCalledWith({
      apiVersion: '20200115',
      computeIntegrityHash: false,
      itemHashes: [
        {
          content: 'test',
          content_type: 'Note',
          created_at: '2021-02-19T11:35:45.655Z',
          deleted: false,
          duplicate_of: null,
          enc_item_key: 'test',
          items_key_id: 'test',
          updated_at: '2021-02-19T11:35:45.655Z',
          uuid: '1-2-3',
        },
      ],
      limit: 150,
      syncToken: 'MjoxNjE3MTk1MzQyLjc1ODEyMTc=',
      userAgent: 'Google Chrome',
      userUuid: '123',
    })

    expect(postToRealtimeExtensions.execute).toHaveBeenCalledWith({
      itemHashes: [
        {
          content: 'test',
          content_type: 'Note',
          created_at: '2021-02-19T11:35:45.655Z',
          deleted: false,
          duplicate_of: null,
          enc_item_key: 'test',
          items_key_id: 'test',
          updated_at: '2021-02-19T11:35:45.655Z',
          uuid: '1-2-3',
        },
      ],
      userUuid: '123',
    })

    expect(result.statusCode).toEqual(200)
    expect(await result.content.readAsStringAsync()).toEqual('{"integrity_hash":"123"}')
  })

  it('should sync items with defaulting API version if none specified', async () => {
    delete request.body.api

    const httpResponse = <results.JsonResult> await createController().sync(request, response)
    const result = await httpResponse.executeAsync()

    expect(syncItems.execute).toHaveBeenCalledWith({
      apiVersion: '20161215',
      computeIntegrityHash: false,
      itemHashes: [
        {
          content: 'test',
          content_type: 'Note',
          created_at: '2021-02-19T11:35:45.655Z',
          deleted: false,
          duplicate_of: null,
          enc_item_key: 'test',
          items_key_id: 'test',
          updated_at: '2021-02-19T11:35:45.655Z',
          uuid: '1-2-3',
        },
      ],
      limit: 150,
      syncToken: 'MjoxNjE3MTk1MzQyLjc1ODEyMTc=',
      userAgent: 'Google Chrome',
      userUuid: '123',
    })

    expect(result.statusCode).toEqual(200)
    expect(await result.content.readAsStringAsync()).toEqual('{"integrity_hash":"123"}')
  })

  it('should sync items even if posting to extensions fails', async () => {
    postToRealtimeExtensions.execute = jest.fn().mockImplementation(() => {
      throw new Error('Oops')
    })

    const httpResponse = <results.JsonResult> await createController().sync(request, response)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(200)
    expect(await result.content.readAsStringAsync()).toEqual('{"integrity_hash":"123"}')
  })

  it('should sync items with no incoming items in request', async () => {
    delete request.body.items

    const httpResponse = <results.JsonResult> await createController().sync(request, response)
    const result = await httpResponse.executeAsync()

    expect(syncItems.execute).toHaveBeenCalledWith({
      apiVersion: '20200115',
      computeIntegrityHash: false,
      itemHashes: [],
      limit: 150,
      syncToken: 'MjoxNjE3MTk1MzQyLjc1ODEyMTc=',
      userAgent: 'Google Chrome',
      userUuid: '123',
    })

    expect(postToRealtimeExtensions.execute).toHaveBeenCalled()

    expect(result.statusCode).toEqual(200)
    expect(await result.content.readAsStringAsync()).toEqual('{"integrity_hash":"123"}')
  })

  it('should not find mfa secret if one does not exist', async () => {
    request.body = {}
    request.params = {
      userUuid: '1-2-3',
    }

    const httpResponse = <results.JsonResult> await createController().findMFASecret(request)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(404)
  })

  it('should not find mfa secret if one is deleted', async () => {
    request.body = {}
    request.params = {
      userUuid: '1-2-3',
    }

    const extension = {} as jest.Mocked<Item>
    extension.deleted = true
    itemRepository.findMFAExtensionByUserUuid = jest.fn().mockReturnValue(extension)

    const httpResponse = <results.JsonResult> await createController().findMFASecret(request)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(404)
  })

  it('should find mfa secret by user uuid', async () => {
    request.body = {}
    request.params = {
      userUuid: '1-2-3',
    }

    const extension = {
      uuid: 'e-1-2-3',
    } as jest.Mocked<Item>
    itemRepository.findMFAExtensionByUserUuid = jest.fn().mockReturnValue(extension)

    const httpResponse = <results.JsonResult> await createController().findMFASecret(request)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(200)
    expect(await result.content.readAsStringAsync()).toEqual('{"secret":"foo","extensionUuid":"e-1-2-3"}')
  })

  it('should not delete mfa secret if one does not exist', async () => {
    request.body = {}
    request.params = {
      userUuid: '1-2-3',
    }

    const httpResponse = <results.NotFoundResult> await createController().removeMFASecret(request)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(404)
  })

  it('should delete mfa secret by user uuid', async () => {
    request.body = {}
    request.params = {
      userUuid: '1-2-3',
    }

    const extension = {
      uuid: 'e-1-2-3',
    } as jest.Mocked<Item>
    itemRepository.findMFAExtensionByUserUuid = jest.fn().mockReturnValue(extension)
    itemRepository.remove = jest.fn()

    const httpResponse = <results.OkResult> await createController().removeMFASecret(request)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(200)
    expect(itemRepository.remove).toHaveBeenCalledWith(extension)
  })

  it('should not delete email backups items if none are found', async () => {
    request.body = {}
    request.params = {
      userUuid: '1-2-3',
    }

    itemRepository.findAll = jest.fn().mockReturnValue([])
    itemRepository.remove = jest.fn()

    const httpResponse = <results.OkResult> await createController().disableEmailBackups(request)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(404)
    expect(itemRepository.remove).not.toHaveBeenCalled()
  })

  it('should skip email backups items that do not have a content', async () => {
    request.body = {}
    request.params = {
      userUuid: '1-2-3',
    }

    const extension = {
      uuid: 'e-1-2-3',
    } as jest.Mocked<Item>
    itemRepository.findAll = jest.fn().mockReturnValue([extension])
    itemRepository.remove = jest.fn()

    const httpResponse = <results.OkResult> await createController().disableEmailBackups(request)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(404)
    expect(itemRepository.remove).not.toHaveBeenCalled()
  })

  it('should skip email backups items that do not have a subtype of backup.email_archive', async () => {
    request.body = {}
    request.params = {
      userUuid: '1-2-3',
    }

    const extension = {
      uuid: 'e-1-2-3',
      content: 'something',
    } as jest.Mocked<Item>
    itemRepository.findAll = jest.fn().mockReturnValue([extension])
    itemRepository.remove = jest.fn()

    const httpResponse = <results.OkResult> await createController().disableEmailBackups(request)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(404)
    expect(itemRepository.remove).not.toHaveBeenCalled()
  })

  it('should disable email backups by deleting SF|Extension items', async () => {
    request.body = {}
    request.params = {
      userUuid: '1-2-3',
    }

    const extension = {
      uuid: 'e-1-2-3',
      content: 'something',
    } as jest.Mocked<Item>
    itemRepository.findAll = jest.fn().mockReturnValue([extension])
    itemRepository.remove = jest.fn()
    contentDecoder.decode = jest.fn().mockReturnValue({ subtype: 'backup.email_archive' })

    const httpResponse = <results.OkResult> await createController().disableEmailBackups(request)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(200)
    expect(itemRepository.remove).toHaveBeenCalledWith(extension)
  })
})
