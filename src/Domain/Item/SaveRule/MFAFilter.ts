import { inject, injectable } from 'inversify'
import TYPES from '../../../Bootstrap/Types'
import { ContentType } from '../ContentType'
import { ItemFactoryInterface } from '../ItemFactoryInterface'
import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'
import { AuthHttpServiceInterface } from '../../Auth/AuthHttpServiceInterface'
import { Logger } from 'winston'
import { ServiceTransitionHelperInterface } from '../../Transition/ServiceTransitionHelperInterface'
import { TimerInterface } from '@standardnotes/time'

@injectable()
export class MFAFilter implements ItemSaveRuleInterface {
  constructor (
    @inject(TYPES.ItemFactory) private itemFactory: ItemFactoryInterface,
    @inject(TYPES.AuthHttpService) private authHttpService: AuthHttpServiceInterface,
    @inject(TYPES.ServiceTransitionHelper) private serviceTransitionHelper: ServiceTransitionHelperInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {
  }

  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    if (dto.itemHash.content_type === ContentType.MFA) {
      try {
        const createdAt = dto.itemHash.created_at_timestamp ?
          dto.itemHash.created_at_timestamp : this.timer.convertStringDateToMicroseconds(dto.itemHash.created_at as string)
        const updatedAt = dto.itemHash.updated_at_timestamp ?
          dto.itemHash.updated_at_timestamp : this.timer.convertStringDateToMicroseconds(dto.itemHash.updated_at as string)

        await this.authHttpService.saveUserMFA({
          uuid: dto.itemHash.uuid,
          userUuid: dto.userUuid,
          encodedMfaSecret: dto.itemHash.content as string,
          createdAt,
          updatedAt,
        })

        await this.serviceTransitionHelper.markUserMFAAsMovedToUserSettings(dto.userUuid, updatedAt)

        const stubItem = this.itemFactory.create(dto.userUuid, dto.itemHash)

        this.logger.debug('Returning a stub item for MFA user setting: %O', stubItem)

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
