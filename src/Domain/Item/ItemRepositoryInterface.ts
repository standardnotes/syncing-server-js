import { Item } from './Item'
import { ItemQuery } from './ItemQuery'

export interface ItemRepositoryInterface {
  findMFAExtensionByUserUuid(userUuid: string): Promise<Item | undefined>
  findAll(query: ItemQuery): Promise<Item[]>
  findByUuidAndUserUuid(uuid: string, userUuid: string): Promise<Item | undefined>
  save(item: Item): Promise<Item>
}
