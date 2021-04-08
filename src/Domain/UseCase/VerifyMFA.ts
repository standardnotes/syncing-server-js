import { inject, injectable } from 'inversify'
import { authenticator } from 'otplib'
import TYPES from '../../Bootstrap/Types'
import { ContentDecoderInterface } from '../Item/ContentDecoderInterface'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { UseCaseInterface } from './UseCaseInterface'
import { VerifyMFADTO } from './VerifyMFADTO'
import { VerifyMFAResponse } from './VerifyMFAResponse'

@injectable()
export class VerifyMFA implements UseCaseInterface {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.ItemRepository) private itemsRepository: ItemRepositoryInterface,
    @inject(TYPES.ContentDecoder) private contentDecoder: ContentDecoderInterface,
  ) {
  }

  async execute(dto: VerifyMFADTO): Promise<VerifyMFAResponse> {
    const user = await this.userRepository.findOneByEmail(dto.email)
    if(!user) {
      return {
        success: true
      }
    }

    const mfaExtension = await this.itemsRepository.findMFAExtensionByUserUuid(user.uuid)

    if (!mfaExtension) {
      return {
        success: true
      }
    }

    const mfaParamKey = `mfa_${mfaExtension.uuid}`
    if (!dto.requestParams[mfaParamKey]) {
      return {
        success: false,
        errorTag: 'mfa-required',
        errorMessage: 'Please enter your two-factor authentication code.',
        errorPayload: { mfa_key: mfaParamKey }
      }
    }

    const mfaContent = this.contentDecoder.decode(mfaExtension.content)

    if (!authenticator.verify({ token: <string> dto.requestParams[mfaParamKey], secret: <string> mfaContent.secret })) {
      return {
        success: false,
        errorTag: 'mfa-invalid',
        errorMessage: 'The two-factor authentication code you entered is incorrect. Please try again.',
        errorPayload: { mfa_key: mfaParamKey },
      }
    }

    return {
      success: true
    }
  }
}
