import 'reflect-metadata'

import * as IORedis from 'ioredis'

import { RedisServiceTransitionHelper } from './RedisServiceTransitionHelper'

describe('RedisServiceTransitionHelper', () => {
  let redisClient: IORedis.Redis

  const createHelper = () => new RedisServiceTransitionHelper(redisClient)

  beforeEach(() => {
    redisClient = {} as jest.Mocked<IORedis.Redis>
    redisClient.set = jest.fn()
    redisClient.get = jest.fn()
    redisClient.del = jest.fn()
  })

  it ('should tell if user has moved MFA from items to user settings', async () => {
    redisClient.get = jest.fn().mockReturnValue(1)

    expect(await createHelper().userHasMovedMFAToUserSettings('1-2-3')).toEqual({ status: 'active' })
  })

  it ('should tell if user did not move MFA from items to user settings', async () => {
    redisClient.get = jest.fn().mockReturnValue(0)

    expect(await createHelper().userHasMovedMFAToUserSettings('1-2-3')).toEqual({ status: 'deleted' })

    redisClient.get = jest.fn().mockReturnValue(null)

    expect(await createHelper().userHasMovedMFAToUserSettings('1-2-3')).toEqual({ status: 'not found' })
  })

  it ('should mark the user as moved MFA from items to user settings and updated at timestamp', async () => {
    await createHelper().markUserMFAAsMovedToUserSettings('1-2-3', 123)

    expect(redisClient.set).toHaveBeenNthCalledWith(1, 'mfa:1-2-3', 1)
    expect(redisClient.set).toHaveBeenNthCalledWith(2, 'mfa_ua:1-2-3', 123)
  })

  it ('should get the timestamp on which the user moved mfa from items to user settings', async () => {
    redisClient.get = jest.fn().mockReturnValue('123')

    expect(await createHelper().getUserMFAUpdatedAtTimestamp('1-2-3')).toEqual(123)
  })

  it ('should mark the user as not moved MFA from items to user settings', async () => {
    await createHelper().markUserMFAAsUserSettingAsDeleted('1-2-3', 125)

    expect(redisClient.set).toHaveBeenNthCalledWith(1, 'mfa:1-2-3', 0)
    expect(redisClient.set).toHaveBeenNthCalledWith(2, 'mfa_ua:1-2-3', 125)
  })
})
