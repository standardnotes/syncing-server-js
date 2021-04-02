import 'reflect-metadata'

import * as express from 'express'

import { ItemsController } from './ItemsController'
import { results } from 'inversify-express-utils'
import { User } from '../Domain/User/User'
import { SyncItems } from '../Domain/UseCase/SyncItems'
import { ApiVersion } from '../Domain/Api/ApiVersion'
import { ContentType } from '../Domain/Item/ContentType'

describe('ItemsController', () => {
  let syncItems: SyncItems
  let request: express.Request
  let response: express.Response
  let user: User

  const createController = () => new ItemsController(syncItems)

  beforeEach(() => {
    syncItems = {} as jest.Mocked<SyncItems>
    syncItems.execute = jest.fn()

    user = {} as jest.Mocked<User>
    user.uuid = '123'

    request = {
      headers: {},
      body: {},
      params: {},
    } as jest.Mocked<express.Request>

    response = {
      locals: {},
    } as jest.Mocked<express.Response>
  })

  it('should sync items', async () => {
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

    response.locals.user = user

    syncItems.execute = jest.fn().mockReturnValue({ foo: 'bar' })

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
    expect(await result.content.readAsStringAsync()).toEqual('{"foo":"bar"}')
  })
})
