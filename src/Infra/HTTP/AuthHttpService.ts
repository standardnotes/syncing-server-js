import { KeyParams } from '@standardnotes/auth'
import { FeatureDescription } from '@standardnotes/features'
import { AxiosInstance } from 'axios'
import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { AuthHttpServiceInterface } from '../../Domain/Auth/AuthHttpServiceInterface'

@injectable()
export class AuthHttpService implements AuthHttpServiceInterface {
  constructor (
    @inject(TYPES.HTTPClient) private httpClient: AxiosInstance,
    @inject(TYPES.AUTH_SERVER_URL) private authServerUrl: string,
  ) {
  }

  async getUserFeatures(userUuid: string): Promise<FeatureDescription[]> {
    const response = await this.httpClient.request({
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      url: `${this.authServerUrl}/internal/users/${userUuid}/features`,
      validateStatus:
        /* istanbul ignore next */
        (status: number) => status >= 200 && status < 500,
    })

    if (!response.data.features) {
      throw new Error('Missing user features from auth service response')
    }

    return response.data.features
  }

  async getUserKeyParams(dto: { email?: string, uuid?: string, authenticated: boolean }): Promise<KeyParams> {
    const keyParamsResponse = await this.httpClient.request({
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      url: `${this.authServerUrl}/users/params`,
      params: dto,
      validateStatus:
        /* istanbul ignore next */
        (status: number) => status >= 200 && status < 500,
    })

    return keyParamsResponse.data
  }
}
