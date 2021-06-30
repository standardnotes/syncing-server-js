import { ItemGetValidationDTO } from './ItemGetValidationDTO'
import { ItemGetValidationResult } from './ItemGetValidationResult'

export interface ItemGetValidatorInterface {
  validate(dto: ItemGetValidationDTO): Promise<ItemGetValidationResult>
}
