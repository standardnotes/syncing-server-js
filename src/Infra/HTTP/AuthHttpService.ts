import { KeyParams } from '@standardnotes/auth'
import { inject, injectable } from 'inversify'
import { SuperAgentStatic } from 'superagent'
import TYPES from '../../Bootstrap/Types'
import { AuthHttpServiceInterface } from '../../Domain/Auth/AuthHttpServiceInterface'

@injectable()
export class AuthHttpService implements AuthHttpServiceInterface {
  constructor (
    @inject(TYPES.HTTPClient) private httpClient: SuperAgentStatic,
    @inject(TYPES.AUTH_SERVER_URL) private authServerUrl: string,
  ) {
  }

  async getUserKeyParams(email: string, authenticated: boolean): Promise<KeyParams> {
    const keyParamsResponse = await this.httpClient
      .get(`${this.authServerUrl}/users/params`)
      .query({ email, authenticated })
      .send()

    return keyParamsResponse.body
  }

  async getAuthMethods(email: string): Promise<unknown> {
    const keyParamsResponse = await this.httpClient
      .get(`${this.authServerUrl}/auth/methods`)
      .query({ email })
      .send()

    return keyParamsResponse.body
  }
}
