import { AxiosInstance } from 'axios'
import 'reflect-metadata'


import { Logger } from 'winston'
import { AuthHttpService } from './AuthHttpService'

describe('AuthHttpService', () => {
  let httpClient: AxiosInstance
  let logger: Logger

  const authServerUrl = 'https://auth-server'

  const createService = () => new AuthHttpService(httpClient, authServerUrl, logger)

  beforeEach(() => {
    httpClient = {} as jest.Mocked<AxiosInstance>
    httpClient.request = jest.fn().mockReturnValue({ data: { foo: 'bar' } })

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
  })

  it('should send a request to auth service in order to get user key params', async () => {
    await createService().getUserKeyParams({
      email: 'test@test.com',
      authenticated: false,
    })

    expect(httpClient.request).toHaveBeenCalledWith({
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      url: 'https://auth-server/users/params',
      params: {
        authenticated: false,
        email: 'test@test.com',
      },
      validateStatus: expect.any(Function),
    })
  })

  it('should send a request to auth service in order to save mfa secret', async () => {
    httpClient.request = jest.fn().mockReturnValue({
      data: {
        setting: {
          uuid: '3-4-5',
        },
      },
    })

    expect(await createService().saveUserMFA({
      uuid: '2-3-4',
      userUuid: '1-2-3',
      encodedMfaSecret: 'test',
      createdAt: 1,
      updatedAt: 1,
    })).toEqual({ uuid: '3-4-5' })

    expect(httpClient.request).toHaveBeenCalledWith({
      method: 'PUT',
      url: 'https://auth-server/users/1-2-3/mfa',
      headers: {
        'Accept': 'application/json',
      },
      validateStatus: expect.any(Function),
      data: {
        value: 'test',
        uuid: '2-3-4',
        createdAt: 1,
        updatedAt: 1,
      },
    })
  })

  it('should throw an error if sending a request to auth service in order to save mfa secret fails', async () => {
    let error = null

    try {
      await createService().saveUserMFA({
        uuid: '2-3-4',
        userUuid: '1-2-3',
        encodedMfaSecret: 'test',
        createdAt: 1,
        updatedAt: 1,
      })
    } catch (caughtError) {
      error = caughtError
    }

    expect(error).not.toBeNull()
  })

  it('should send a request to auth service in order to get user mfa secret', async () => {
    httpClient.request = jest.fn().mockReturnValue({
      data: {
        setting: {
          value: 'top-secret',
        },
      },
    })

    expect(await createService().getUserMFA('1-2-3')).toEqual({ value: 'top-secret' })

    expect(httpClient.request).toHaveBeenCalledWith({
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      validateStatus: expect.any(Function),
      url: 'https://auth-server/users/1-2-3/mfa',
    })
  })

  it('should send a request to auth service in order to delete user mfa secret', async () => {
    expect(await createService().removeUserMFA({
      userUuid: '1-2-3',
      uuid: '2-3-4',
      updatedAt: 123,
    }))

    expect(httpClient.request).toHaveBeenCalledWith({
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
      data: {
        uuid: '2-3-4',
        updatedAt: 123,
      },
      validateStatus: expect.any(Function),
      url: 'https://auth-server/users/1-2-3/mfa',
    })
  })

  it('should throw an error if sending a request to auth service in order to get user mfa secret fails', async () => {
    let error = null

    try {
      await createService().getUserMFA('1-2-3')
    } catch (caughtError) {
      error = caughtError
    }

    expect(error).not.toBeNull()
  })
})
