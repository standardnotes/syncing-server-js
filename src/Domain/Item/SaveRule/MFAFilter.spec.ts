import 'reflect-metadata'
import { Logger } from 'winston'
import { ApiVersion } from '../../Api/ApiVersion'
import { AuthHttpServiceInterface } from '../../Auth/AuthHttpServiceInterface'
import { ContentType } from '../ContentType'
import { Item } from '../Item'
import { ItemFactoryInterface } from '../ItemFactoryInterface'

import { MFAFilter } from './MFAFilter'

describe('MFAFilter', () => {
  let itemFactory: ItemFactoryInterface
  let item: Item
  let authHttpService: AuthHttpServiceInterface
  let logger: Logger

  const createFilter = () => new MFAFilter(itemFactory, authHttpService, logger)

  beforeEach(() => {
    item = {} as jest.Mocked<Item>

    itemFactory = {} as jest.Mocked<ItemFactoryInterface>
    itemFactory.create = jest.fn().mockReturnValue(item)

    authHttpService = {} as jest.Mocked<AuthHttpServiceInterface>
    authHttpService.saveUserMFA = jest.fn().mockReturnValue('5-6-7')

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
  })

  it ('should filter out mfa item so it can be skipped on database save', async () => {
    const result = await createFilter().check({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      itemHash: {
        uuid: '2-3-4',
        content_type: ContentType.MFA,
      },
    })

    expect(result).toEqual({
      passed: false,
      skipped: {
        uuid: 'mfa-5-6-7',
      },
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
        content_type: ContentType.MFA,
      },
    })

    expect(result).toEqual({
      passed: false,
      conflict: {
        unsavedItem: {
          uuid: '2-3-4',
          content_type: ContentType.MFA,
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
})
