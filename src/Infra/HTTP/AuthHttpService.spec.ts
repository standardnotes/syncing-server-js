import 'reflect-metadata'

import { AxiosInstance } from 'axios'

import { AuthHttpService } from './AuthHttpService'

describe('AuthHttpService', () => {
  let httpClient: AxiosInstance

  const authServerUrl = 'https://auth-server'

  const createService = () => new AuthHttpService(httpClient, authServerUrl)

  beforeEach(() => {
    httpClient = {} as jest.Mocked<AxiosInstance>
    httpClient.request = jest.fn().mockReturnValue({ data: { foo: 'bar' } })
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

  it('should send a request to auth service in order to get user features', async () => {
    httpClient.request = jest.fn().mockReturnValue({
      data: {
        features: [
          {
            identifier: 'test',
          },
        ],
      },
    })

    await createService().getUserFeatures('1-2-3')

    expect(httpClient.request).toHaveBeenCalledWith({
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      url: 'https://auth-server/internal/users/1-2-3/features',
      validateStatus: expect.any(Function),
    })
  })

  it('should throw an error if a request to auth service in order to get user features fails', async () => {
    let error = null
    try {
      await createService().getUserFeatures('1-2-3')
    } catch (caughtError) {
      error = caughtError
    }

    expect(error).not.toBeNull()
  })
})
