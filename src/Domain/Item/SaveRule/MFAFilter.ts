import { inject, injectable } from 'inversify'
import TYPES from '../../../Bootstrap/Types'
import { ContentType } from '../ContentType'
import { ItemFactoryInterface } from '../ItemFactoryInterface'
import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'
import { AuthHttpServiceInterface } from '../../Auth/AuthHttpServiceInterface'
import { Logger } from 'winston'

@injectable()
export class MFAFilter implements ItemSaveRuleInterface {
  constructor (
    @inject(TYPES.ItemFactory) private itemFactory: ItemFactoryInterface,
    @inject(TYPES.AuthHttpService) private authHttpService: AuthHttpServiceInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {
  }

  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    if (dto.itemHash.content_type === ContentType.MFA) {
      try {
        const mfaUserSettingUuid = await this.authHttpService.saveUserMFA({
          userUuid: dto.userUuid,
          mfaSecret: dto.itemHash.content as string,
        })

        const stubItem = this.itemFactory.create(dto.userUuid, dto.itemHash)
        stubItem.uuid = `mfa-${mfaUserSettingUuid}`

        return {
          passed: false,
          skipped: stubItem,
        }
      } catch (error) {
        this.logger.debug(`Could not save user MFA as user setting: ${error.message}`)

        return {
          passed: false,
          conflict: {
            unsavedItem: dto.itemHash,
            type: 'sync_conflict',
          },
        }
      }
    }

    return {
      passed: true,
    }
  }
}
