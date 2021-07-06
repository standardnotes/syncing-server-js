import { KeyParams } from '@standardnotes/auth'
import { AxiosInstance } from 'axios'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { AuthHttpServiceInterface } from '../../Domain/Auth/AuthHttpServiceInterface'

@injectable()
export class AuthHttpService implements AuthHttpServiceInterface {
  constructor (
    @inject(TYPES.HTTPClient) private httpClient: AxiosInstance,
    @inject(TYPES.AUTH_SERVER_URL) private authServerUrl: string,
    @inject(TYPES.Logger) private logger: Logger,
  ) {
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

  async saveUserMFA(dto: { uuid: string, userUuid: string, encodedMfaSecret: string }): Promise<string> {
    const response = await this.httpClient
      .request({
        method: 'PUT',
        url: `${this.authServerUrl}/users/${dto.userUuid}/mfa`,
        headers: {
          'Accept': 'application/json',
        },
        validateStatus:
          /* istanbul ignore next */
          (status: number) => status >= 200 && status < 500,
        data: {
          value: dto.encodedMfaSecret,
          uuid: dto.uuid,
        },
      })

    this.logger.debug('Auth server response (%s) for saving MFA: %O', response.status, response.data)

    if (!response.data.setting) {
      throw new Error('Missing mfa setting uuid from auth service response')
    }

    return response.data.setting
  }

  async removeUserMFA(userUuid: string): Promise<void> {
    const response = await this.httpClient
      .request({
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
        validateStatus:
          /* istanbul ignore next */
          (status: number) => status >= 200 && status < 500,
        url: `${this.authServerUrl}/users/${userUuid}/mfa`,
      })

    this.logger.debug('Auth server response (%s) for deleting MFA: %O', response.status, response.data)
  }

  async getUserMFA(userUuid: string): Promise<{
    uuid: string,
    name: string,
    value: string,
    createdAt: number,
    updatedAt: number
  }> {
    const response = await this.httpClient
      .request({
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        validateStatus:
          /* istanbul ignore next */
          (status: number) => status >= 200 && status < 500,
        url: `${this.authServerUrl}/users/${userUuid}/mfa`,
      })

    this.logger.debug('Auth server response (%s) for getting MFA: %O', response.status, response.data)

    if (!response.data.setting?.value) {
      throw new Error('Missing mfa setting value from auth service response')
    }

    const setting = response.data.setting

    return setting
  }
}
