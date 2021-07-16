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

  async saveUserMFA(dto: {
    uuid: string,
    userUuid: string,
    encodedMfaSecret: string,
    createdAt: number,
    updatedAt: number
  }): Promise<string> {
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
          createdAt: dto.createdAt,
          updatedAt: dto.updatedAt,
        },
      })

    this.logger.debug('[%s] Auth server response (%s) for saving MFA: %O', dto.userUuid, response.status, response.data)

    if (!response.data.setting) {
      throw new Error('Missing mfa setting uuid from auth service response')
    }

    return response.data.setting
  }

  async removeUserMFA(dto: {
    uuid: string,
    userUuid: string,
    updatedAt: number
  }): Promise<void> {
    const response = await this.httpClient
      .request({
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
        data: {
          uuid: dto.uuid,
          updatedAt: dto.updatedAt,
        },
        validateStatus:
          /* istanbul ignore next */
          (status: number) => status >= 200 && status < 500,
        url: `${this.authServerUrl}/users/${dto.userUuid}/mfa`,
      })

    this.logger.debug('[%s] Auth server response (%s) for deleting MFA: %O', dto.userUuid, response.status, response.data)
  }

  async getUserMFA(userUuid: string, lastSyncTime?: number): Promise<Array<{
    uuid: string,
    name: string,
    value: string | null,
    createdAt: number,
    updatedAt: number
  }>> {
    const response = await this.httpClient
      .request({
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        data: {
          lastSyncTime,
        },
        validateStatus:
          /* istanbul ignore next */
          (status: number) => status >= 200 && status < 500,
        url: `${this.authServerUrl}/users/${userUuid}/mfa`,
      })

    this.logger.debug('[%s] Auth server response (%s) for getting MFA: %O', userUuid, response.status, response.data)

    if (!response.data.settings) {
      throw new Error('Missing mfa settings from auth service response')
    }

    return response.data.settings
  }
}
