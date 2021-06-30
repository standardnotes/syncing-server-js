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

  async saveUserMFA(dto: { userUuid: string, mfaSecret: string }): Promise<string> {
    const response = await this.httpClient
      .put(`${this.authServerUrl}/users/${dto.userUuid}/mfa`)
      .send({
        value: dto.mfaSecret,
      })

    if (!response.body?.setting?.uuid) {
      throw new Error('Missing mfa setting uuid from auth service response')
    }

    return response.body.setting.uuid
  }

  async getUserMFA(userUuid: string): Promise<{
    uuid: string,
    name: string,
    value: string,
    createdAt: string,
    updatedAt: string
  }> {
    const response = await this.httpClient
      .get(`${this.authServerUrl}/users/${userUuid}/mfa`)
      .send()

    if (!response.body?.setting?.value) {
      throw new Error('Missing mfa setting value from auth service response')
    }

    return response.body.setting
  }
}
