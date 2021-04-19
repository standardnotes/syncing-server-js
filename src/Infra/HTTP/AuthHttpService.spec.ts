import 'reflect-metadata'

import { SuperAgentRequest, SuperAgentStatic } from 'superagent'
import { AuthHttpService } from './AuthHttpService'

describe('AuthHttpService', () => {
  let httpClient: SuperAgentStatic
  let request: SuperAgentRequest
  const authServerUrl = 'https://auth-server'

  const createService = () => new AuthHttpService(httpClient, authServerUrl)

  beforeEach(() => {
    request = {} as jest.Mocked<SuperAgentRequest>
    request.query = jest.fn().mockReturnThis()
    request.send = jest.fn().mockReturnThis()

    httpClient = {} as jest.Mocked<SuperAgentStatic>
    httpClient.get = jest.fn().mockReturnValue(request)
  })

  it('should send a request to auth service in order to get user key params', async () => {
    await createService().getUserKeyParams({
      email: 'test@test.com',
      authenticated: false,
    })

    expect(httpClient.get).toHaveBeenCalledWith('https://auth-server/users/params')
    expect(request.query).toHaveBeenCalledWith({ email: 'test@test.com', authenticated: false })
    expect(request.send).toHaveBeenCalled()
  })
})
