import { injectable } from 'inversify'
import { ItemGetRuleInterface } from '../GetRule/ItemGetRuleInterface'
import { ItemGetValidationDTO } from './ItemGetValidationDTO'
import { ItemGetValidationResult } from './ItemGetValidationResult'
import { ItemGetValidatorInterface } from './ItemGetValidatorInterface'

@injectable()
export class ItemGetValidator implements ItemGetValidatorInterface {
  constructor(
    private rules: Array<ItemGetRuleInterface>
  ) {
  }

  async validate(dto: ItemGetValidationDTO): Promise<ItemGetValidationResult> {
    for (const rule of this.rules) {
      const result = await rule.check(dto)
      if (!result.passed) {
        return {
          passed: false,
          replaced: result.replaced,
        }
      }
    }

    return {
      passed: true,
    }
  }
}
