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

  async getUserKeyParams(dto: { email?: string, uuid?: string, authenticated: boolean }): Promise<KeyParams> {
    const keyParamsResponse = await this.httpClient
      .get(`${this.authServerUrl}/users/params`)
      .query(dto)
      .send()

    return keyParamsResponse.body
  }
}
