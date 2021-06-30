import { TimerInterface } from '@standardnotes/time'
import 'reflect-metadata'
import { Logger } from 'winston'
import { AuthHttpServiceInterface } from '../../Auth/AuthHttpServiceInterface'
import { ContentType } from '../ContentType'
import { Item } from '../Item'

import { MFARule } from './MFARule'

describe('MFARule', () => {
  let authHttpService: AuthHttpServiceInterface
  let item: Item
  let timer: TimerInterface
  let logger: Logger

  const createRule = () => new MFARule(authHttpService, timer, logger)

  beforeEach(() => {
    authHttpService = {} as jest.Mocked<AuthHttpServiceInterface>
    authHttpService.getUserMFA = jest.fn().mockReturnValue({
      uuid: '1-2-3',
      name: 'MFA_SECRET',
      value: 'test',
      createdAt: (new Date(1)).toString(),
      updatedAt: (new Date(2)).toString(),
    })

    item = {} as jest.Mocked<Item>
    item.userUuid = '2-3-4'
    item.contentType = ContentType.MFA

    timer = {} as jest.Mocked<TimerInterface>
    timer.convertStringDateToDate = jest.fn()
      .mockReturnValueOnce(new Date(1))
      .mockReturnValueOnce(new Date(2))
    timer.convertStringDateToMicroseconds = jest.fn()
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(2)

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
  })

  it('should replace the MFA item with data from UserSetting', async () => {
    const result = await createRule().check({ item })

    expect(result).toEqual({
      passed: false,
      replaced: {
        contentType: 'SF|MFA',
        createdAt: new Date(1),
        createdAtTimestamp: 1,
        updatedAt: new Date(2),
        updatedAtTimestamp: 2,
        userUuid: '2-3-4',
        uuid: 'mfa-1-2-3',
      },
    })
  })

  it('should not replace the MFA item if calling auth service fails', async () => {
    authHttpService.getUserMFA = jest.fn().mockImplementation(() => {
      throw new Error('Oops!')
    })

    const result = await createRule().check({ item })

    expect(result).toEqual({
      passed: false,
      replaced: item,
    })
  })

  it('should leave the item if it is not an MFA item', async () => {
    item.contentType = ContentType.Note

    const result = await createRule().check({ item })

    expect(result).toEqual({
      passed: true,
    })
  })
})
