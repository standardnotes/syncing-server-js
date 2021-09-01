import 'reflect-metadata'

import { TimerInterface } from '@standardnotes/time'
import { ContentType } from '@standardnotes/common'
import { Logger } from 'winston'
import { ApiVersion } from '../../Api/ApiVersion'
import { AuthHttpServiceInterface } from '../../Auth/AuthHttpServiceInterface'
import { ServiceTransitionHelperInterface } from '../../Transition/ServiceTransitionHelperInterface'
import { ContentDecoderInterface } from '../ContentDecoderInterface'
import { Item } from '../Item'
import { ItemFactoryInterface } from '../ItemFactoryInterface'
import { ItemRepositoryInterface } from '../ItemRepositoryInterface'

import { MFAFilter } from './MFAFilter'

describe('MFAFilter', () => {
  let itemFactory: ItemFactoryInterface
  let item: Item
  let authHttpService: AuthHttpServiceInterface
  let serviceTransitionHelper: ServiceTransitionHelperInterface
  let itemRepository: ItemRepositoryInterface
  let timer: TimerInterface
  let contentDecoder: ContentDecoderInterface
  let logger: Logger

  const createFilter = () => new MFAFilter(itemFactory, authHttpService, serviceTransitionHelper, itemRepository, timer, contentDecoder, logger)

  beforeEach(() => {
    item = {} as jest.Mocked<Item>

    itemFactory = {} as jest.Mocked<ItemFactoryInterface>
    itemFactory.createStub = jest.fn().mockReturnValue(item)

    authHttpService = {} as jest.Mocked<AuthHttpServiceInterface>
    authHttpService.saveUserMFA = jest.fn().mockReturnValue({ uuid: '5-6-7' })
    authHttpService.removeUserMFA = jest.fn()

    serviceTransitionHelper = {} as jest.Mocked<ServiceTransitionHelperInterface>
    serviceTransitionHelper.markUserMFAAsMovedToUserSettings = jest.fn()
    serviceTransitionHelper.markUserMFAAsUserSettingAsDeleted = jest.fn()

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.deleteMFAExtensionByUserUuid = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.convertStringDateToMicroseconds = jest.fn().mockReturnValue(1)
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(123)

    contentDecoder = {} as jest.Mocked<ContentDecoderInterface>
    contentDecoder.decode = jest.fn().mockReturnValue({
      secret: 'foo',
    })

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
  })

  it ('should filter out mfa item so it can be skipped on database save', async () => {
    const result = await createFilter().check({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      itemHash: {
        uuid: '2-3-4',
        content_type: ContentType.Mfa,
      },
    })

    expect(result).toEqual({
      passed: false,
      skipped: item,
    })
  })

  it ('should filter out mfa item with given timestamps so it can be skipped on database save', async () => {
    const result = await createFilter().check({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      itemHash: {
        uuid: '2-3-4',
        content_type: ContentType.Mfa,
        created_at_timestamp: 1,
        updated_at_timestamp: 1,
      },
    })

    expect(itemRepository.deleteMFAExtensionByUserUuid).toHaveBeenCalledWith('1-2-3')

    expect(result).toEqual({
      passed: false,
      skipped: item,
    })
  })

  it ('should filter out mfa item given dates at so it can be skipped on database save', async () => {
    timer.convertStringDateToMicroseconds = jest.fn().mockReturnValue(0)

    const result = await createFilter().check({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      itemHash: {
        uuid: '2-3-4',
        content_type: ContentType.Mfa,
        created_at: '2021-07-08T11:43:36.342Z',
        updated_at: '1970-01-01T00:00:00.000Z',
      },
    })

    expect(itemRepository.deleteMFAExtensionByUserUuid).toHaveBeenCalledWith('1-2-3')

    expect(result).toEqual({
      passed: false,
      skipped: item,
    })
  })

  it ('should filter out mfa item if it fails to reach the auth service', async () => {
    authHttpService.saveUserMFA = jest.fn().mockImplementation(() => {
      throw new Error('Oops!')
    })

    const result = await createFilter().check({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      itemHash: {
        uuid: '2-3-4',
        content_type: ContentType.Mfa,
      },
    })

    expect(result).toEqual({
      passed: false,
      conflict: {
        unsavedItem: {
          uuid: '2-3-4',
          content_type: ContentType.Mfa,
        },
        type: 'sync_conflict',
      },
    })
  })

  it ('should leave non mfa item so it can be saved to database', async () => {
    const result = await createFilter().check({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      itemHash: {
        uuid: '2-3-4',
        content_type: ContentType.Note,
      },
    })

    expect(result).toEqual({
      passed: true,
    })
  })

  it ('should filter out deleted mfa item so it can be skipped on database save', async () => {
    const result = await createFilter().check({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      itemHash: {
        uuid: '2-3-4',
        deleted: true,
        content_type: ContentType.Mfa,
        created_at: '2021-07-08T11:43:36.342Z',
        updated_at: '2021-07-08T11:43:36.342Z',
      },
    })

    expect(authHttpService.removeUserMFA).toHaveBeenCalledWith({
      userUuid: '1-2-3',
      uuid: '2-3-4',
      updatedAt: 123,
    })

    expect(serviceTransitionHelper.markUserMFAAsUserSettingAsDeleted).toHaveBeenCalledWith(
      '1-2-3',
      123
    )

    expect(result).toEqual({
      passed: false,
      skipped: item,
    })
  })
})
