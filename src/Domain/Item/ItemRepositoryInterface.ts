import { Item } from './Item'
import { ItemQuery } from './ItemQuery'

export interface ItemRepositoryInterface {
  findMFAExtensionByUserUuid(userUuid: string): Promise<Item | undefined>
  findAll(query: ItemQuery): Promise<Item[]>
  findDatesForComputingIntegrityHash(userUuid: string): Promise<number[]>
  findByUuidAndUserUuid(uuid: string, userUuid: string): Promise<Item | undefined>
  save(item: Item): Promise<Item>
}
