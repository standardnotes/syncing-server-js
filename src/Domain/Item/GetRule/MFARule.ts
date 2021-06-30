import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import { TimerInterface } from '@standardnotes/time'

import TYPES from '../../../Bootstrap/Types'
import { ContentType } from '../ContentType'
import { ItemGetValidationDTO } from '../GetValidator/ItemGetValidationDTO'
import { ItemGetRuleResult } from './ItemGetRuleResult'
import { ItemGetRuleInterface } from './ItemGetRuleInterface'
import { AuthHttpServiceInterface } from '../../Auth/AuthHttpServiceInterface'

@injectable()
export class MFARule implements ItemGetRuleInterface {
  constructor (
    @inject(TYPES.AuthHttpService) private authHttpService: AuthHttpServiceInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {
  }

  async check(dto: ItemGetValidationDTO): Promise<ItemGetRuleResult> {
    if (dto.item.contentType === ContentType.MFA) {
      try {
        const mfaUserSetting = await this.authHttpService.getUserMFA(dto.item.userUuid)

        this.logger.debug('Retrieved user %s MFA setting: %O', dto.item.userUuid, mfaUserSetting)

        const replaced = Object.assign({}, dto.item)

        replaced.uuid = `mfa-${mfaUserSetting.uuid}`
        replaced.createdAt = this.timer.convertStringDateToDate(mfaUserSetting.createdAt)
        replaced.updatedAt = this.timer.convertStringDateToDate(mfaUserSetting.updatedAt)
        replaced.createdAtTimestamp = this.timer.convertStringDateToMicroseconds(mfaUserSetting.createdAt)
        replaced.updatedAtTimestamp = this.timer.convertStringDateToMicroseconds(mfaUserSetting.updatedAt)

        return {
          passed: false,
          replaced,
        }
      } catch (error) {
        this.logger.debug(`Could not get user MFA user setting: ${error.message}`)

        return {
          passed: false,
          replaced: dto.item,
        }
      }
    }

    return {
      passed: true,
    }
  }
}
