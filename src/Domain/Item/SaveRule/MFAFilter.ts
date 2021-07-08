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
import { ItemRepositoryInterface } from '../ItemRepositoryInterface'

@injectable()
export class MFAFilter implements ItemSaveRuleInterface {
  constructor (
    @inject(TYPES.ItemFactory) private itemFactory: ItemFactoryInterface,
    @inject(TYPES.AuthHttpService) private authHttpService: AuthHttpServiceInterface,
    @inject(TYPES.ServiceTransitionHelper) private serviceTransitionHelper: ServiceTransitionHelperInterface,
    @inject(TYPES.ItemRepository) private itemRepository: ItemRepositoryInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {
  }

  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    if (dto.itemHash.content_type === ContentType.MFA) {
      try {
        let result: ItemSaveRuleResult
        switch (dto.itemHash.deleted) {
        case true:
          result = await this.deleteUserMfaUserSetting(dto)
          break
        default:
          result = await this.saveUserMFAUserSetting(dto)
          break
        }

        return result
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

  private async deleteUserMfaUserSetting(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    const updatedAt = this.timer.getTimestampInMicroseconds()

    await this.authHttpService.removeUserMFA(dto.userUuid)

    await this.serviceTransitionHelper.markUserMFAAsUserSettingAsDeleted(dto.userUuid, updatedAt)

    const stubItem = this.itemFactory.create(dto.userUuid, dto.itemHash)

    return {
      passed: false,
      skipped: stubItem,
    }
  }

  private async saveUserMFAUserSetting(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    const createdAt = this.calculateCreatedAtTimestamp(dto)
    const updatedAt = this.timer.getTimestampInMicroseconds()

    await this.authHttpService.saveUserMFA({
      uuid: dto.itemHash.uuid,
      userUuid: dto.userUuid,
      encodedMfaSecret: dto.itemHash.content as string,
      createdAt,
      updatedAt,
    })

    await this.serviceTransitionHelper.markUserMFAAsMovedToUserSettings(dto.userUuid, updatedAt)

    await this.itemRepository.deleteMFAExtensionByUserUuid(dto.userUuid)

    const stubItem = this.itemFactory.create(dto.userUuid, dto.itemHash)

    this.logger.debug('Returning a stub item for MFA user setting: %O', stubItem)

    return {
      passed: false,
      skipped: stubItem,
    }
  }

  private calculateCreatedAtTimestamp(dto: ItemSaveValidationDTO): number {
    if (dto.itemHash.created_at_timestamp !== undefined) {
      return dto.itemHash.created_at_timestamp
    }

    if (dto.itemHash.created_at !== undefined) {
      return this.timer.convertStringDateToMicroseconds(dto.itemHash.created_at as string)
    }

    return this.timer.getTimestampInMicroseconds()
  }
}
