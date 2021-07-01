import { KeyParams } from '@standardnotes/auth'
import { inject, injectable } from 'inversify'
import { SuperAgentStatic } from 'superagent'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { AuthHttpServiceInterface } from '../../Domain/Auth/AuthHttpServiceInterface'
import { ContentDecoderInterface } from '../../Domain/Item/ContentDecoderInterface'

@injectable()
export class AuthHttpService implements AuthHttpServiceInterface {
  constructor (
    @inject(TYPES.HTTPClient) private httpClient: SuperAgentStatic,
    @inject(TYPES.AUTH_SERVER_URL) private authServerUrl: string,
    @inject(TYPES.ContentDecoder) private contentDecoder: ContentDecoderInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {
  }

  async getUserKeyParams(dto: { email?: string, uuid?: string, authenticated: boolean }): Promise<KeyParams> {
    const keyParamsResponse = await this.httpClient
      .get(`${this.authServerUrl}/users/params`)
      .query(dto)
      .send()

    return keyParamsResponse.body
  }

  async saveUserMFA(dto: { uuid: string, userUuid: string, encodedMfaSecret: string }): Promise<string> {
    const mfaContentDecoded = this.contentDecoder.decode(dto.encodedMfaSecret)

    const response = await this.httpClient
      .put(`${this.authServerUrl}/users/${dto.userUuid}/mfa`)
      .send({
        value: mfaContentDecoded.secret,
        uuid: dto.uuid,
      })

    this.logger.debug('Auth server response (%s) for saving MFA: %O', response.status, response.body)

    if (!response.body?.setting) {
      throw new Error('Missing mfa setting uuid from auth service response')
    }

    return response.body.setting
  }

  async getUserMFA(userUuid: string): Promise<{
    uuid: string,
    name: string,
    value: string,
    createdAt: number,
    updatedAt: number
  }> {
    const response = await this.httpClient
      .get(`${this.authServerUrl}/users/${userUuid}/mfa`)
      .send()

    this.logger.debug('Auth server response (%s) for getting MFA: %O', response.status, response.body)

    if (!response.body?.setting?.value) {
      throw new Error('Missing mfa setting value from auth service response')
    }

    return response.body.setting
  }
}
