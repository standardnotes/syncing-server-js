import 'reflect-metadata'

import * as express from 'express'

import { AdminController } from './AdminController'
import { results } from 'inversify-express-utils'
import { ApiVersion } from '../Domain/Api/ApiVersion'
import { ItemRepositoryInterface } from '../Domain/Item/ItemRepositoryInterface'
import { Item } from '../Domain/Item/Item'
import { ContentDecoderInterface } from '../Domain/Item/ContentDecoderInterface'
import { TimerInterface } from '@standardnotes/time'

describe('AdminController', () => {
  let request: express.Request
  let response: express.Response
  let itemRepository: ItemRepositoryInterface
  let contentDecoder: ContentDecoderInterface
  let timer: TimerInterface

  const createController = () => new AdminController(
    itemRepository,
    contentDecoder,
    timer
  )

  beforeEach(() => {
    request = {
      headers: {},
      body: {},
      params: {},
    } as jest.Mocked<express.Request>

    request.body.api = ApiVersion.v20200115
    request.headers['user-agent'] = 'Google Chrome'

    response = {
      locals: {},
    } as jest.Mocked<express.Response>
    response.locals.user = {
      uuid: '123',
    }

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findMFAExtensionByUserUuid = jest.fn()

    contentDecoder = {} as jest.Mocked<ContentDecoderInterface>
    contentDecoder.decode = jest.fn().mockReturnValue({
      secret: 'foo',
    })

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn(() => 1616161616161616)
  })

  it('should not delete email backups items if none are found', async () => {
    request.body = {}
    request.params = {
      userUuid: '1-2-3',
    }

    itemRepository.findAll = jest.fn().mockReturnValue([])
    itemRepository.markItemsAsDeleted = jest.fn()

    const httpResponse = <results.OkResult> await createController().disableEmailBackups(request)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(400)
    expect(await result.content.readAsStringAsync()).toEqual('No email backups found')
    expect(itemRepository.markItemsAsDeleted).not.toHaveBeenCalled()
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
    itemRepository.markItemsAsDeleted = jest.fn()

    const httpResponse = <results.OkResult> await createController().disableEmailBackups(request)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(400)
    expect(await result.content.readAsStringAsync()).toEqual('No email backups found')
    expect(itemRepository.markItemsAsDeleted).not.toHaveBeenCalled()
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
    itemRepository.markItemsAsDeleted = jest.fn()

    const httpResponse = <results.OkResult> await createController().disableEmailBackups(request)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(400)
    expect(await result.content.readAsStringAsync()).toEqual('No email backups found')
    expect(itemRepository.markItemsAsDeleted).not.toHaveBeenCalledWith(extension)
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
    itemRepository.markItemsAsDeleted = jest.fn()
    contentDecoder.decode = jest.fn().mockReturnValue({ subtype: 'backup.email_archive' })

    const httpResponse = <results.OkResult> await createController().disableEmailBackups(request)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(200)
    expect(itemRepository.markItemsAsDeleted).toHaveBeenCalledWith(
      ['e-1-2-3'],
      1616161616161616
    )
  })
})
