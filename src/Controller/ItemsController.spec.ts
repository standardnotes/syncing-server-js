import 'reflect-metadata'

import * as express from 'express'
import { ContentType } from '@standardnotes/common'

import { ItemsController } from './ItemsController'
import { results } from 'inversify-express-utils'
import { SyncItems } from '../Domain/UseCase/SyncItems'
import { ApiVersion } from '../Domain/Api/ApiVersion'
import { SyncResponseFactoryResolverInterface } from '../Domain/Item/SyncResponse/SyncResponseFactoryResolverInterface'
import { SyncResponseFactoryInterface } from '../Domain/Item/SyncResponse/SyncResponseFactoryInterface'
import { SyncResponse20200115 } from '../Domain/Item/SyncResponse/SyncResponse20200115'

describe('ItemsController', () => {
  let syncItems: SyncItems
  let request: express.Request
  let response: express.Response
  let syncResponceFactoryResolver: SyncResponseFactoryResolverInterface
  let syncResponseFactory: SyncResponseFactoryInterface
  let syncResponse: SyncResponse20200115

  const createController = () => new ItemsController(
    syncItems,
    syncResponceFactoryResolver
  )

  beforeEach(() => {
    syncItems = {} as jest.Mocked<SyncItems>
    syncItems.execute = jest.fn().mockReturnValue({ foo: 'bar' })

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

    expect(result.statusCode).toEqual(200)
    expect(await result.content.readAsStringAsync()).toEqual('{"integrity_hash":"123"}')
  })
})
