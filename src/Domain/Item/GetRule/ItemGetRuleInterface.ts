import { ItemGetValidationDTO } from '../GetValidator/ItemGetValidationDTO'
import { ItemGetRuleResult } from './ItemGetRuleResult'

export interface ItemGetRuleInterface {
  check(dto: ItemGetValidationDTO): Promise<ItemGetRuleResult>
}
