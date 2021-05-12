import 'reflect-metadata'

import * as express from 'express'

import { ItemsController } from './ItemsController'
import { results } from 'inversify-express-utils'
import { User } from '../Domain/User/User'
import { SyncItems } from '../Domain/UseCase/SyncItems'
import { ApiVersion } from '../Domain/Api/ApiVersion'
import { ContentType } from '../Domain/Item/ContentType'
import { PostToRealtimeExtensions } from '../Domain/UseCase/PostToRealtimeExtensions/PostToRealtimeExtensions'
import { SyncResponseFactoryResolverInterface } from '../Domain/Item/SyncResponse/SyncResponseFactoryResolverInterface'
import { SyncResponseFactoryInterface } from '../Domain/Item/SyncResponse/SyncResponseFactoryInterface'
import { SyncResponse20200115 } from '../Domain/Item/SyncResponse/SyncResponse20200115'
import { PostToDailyExtensions } from '../Domain/UseCase/PostToDailyExtensions/PostToDailyExtensions'
import { Logger } from 'winston'

describe('ItemsController', () => {
  let syncItems: SyncItems
  let postToRealtimeExtensions: PostToRealtimeExtensions
  let request: express.Request
  let response: express.Response
  let user: User
  let syncResponceFactoryResolver: SyncResponseFactoryResolverInterface
  let syncResponseFactory: SyncResponseFactoryInterface
  let syncResponse: SyncResponse20200115
  let postToDailyExtensions: PostToDailyExtensions
  let logger: Logger

  const createController = () => new ItemsController(syncItems, syncResponceFactoryResolver, postToRealtimeExtensions, postToDailyExtensions, logger)

  beforeEach(() => {
    syncItems = {} as jest.Mocked<SyncItems>
    syncItems.execute = jest.fn().mockReturnValue({ foo: 'bar' })

    postToRealtimeExtensions = {} as jest.Mocked<PostToRealtimeExtensions>
    postToRealtimeExtensions.execute = jest.fn()

    postToDailyExtensions = {} as jest.Mocked<PostToDailyExtensions>
    postToDailyExtensions.execute = jest.fn()

    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()

    user = {} as jest.Mocked<User>
    user.uuid = '123'

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
    response.locals.user = user

    syncResponse = {
      integrity_hash: '123',
    } as jest.Mocked<SyncResponse20200115>

    syncResponseFactory = {} as jest.Mocked<SyncResponseFactoryInterface>
    syncResponseFactory.createResponse = jest.fn().mockReturnValue(syncResponse)

    syncResponceFactoryResolver = {} as jest.Mocked<SyncResponseFactoryResolverInterface>
    syncResponceFactoryResolver.resolveSyncResponseFactoryVersion = jest.fn().mockReturnValue(syncResponseFactory)
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
})
