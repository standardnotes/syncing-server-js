import { Item } from './Item'
import { ItemQuery } from './ItemQuery'

export interface ItemRepositoryInterface {
  findMFAExtensionByUserUuid(userUuid: string): Promise<Item | undefined>
  deleteMFAExtensionByUserUuid(userUuid: string): Promise<void>
  findAll(query: ItemQuery): Promise<Item[]>
  findDatesForComputingIntegrityHash(userUuid: string): Promise<Array<{content_type: string, updated_at_timestamp: number}>>
  findByUuidAndUserUuid(uuid: string, userUuid: string): Promise<Item | undefined>
  findByUuid(uuid: string): Promise<Item | undefined>
  remove(item: Item): Promise<Item>
  save(item: Item): Promise<Item>
  markAsDeleted(item: Item): Promise<void>
}
