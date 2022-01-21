import { Item } from './Item'
import { ItemQuery } from './ItemQuery'
import { ReadStream } from 'fs'

export interface ItemRepositoryInterface {
  deleteByUserUuid(userUuid: string): Promise<void>
  findAll(query: ItemQuery): Promise<Item[]>
  streamAll(query: ItemQuery): Promise<ReadStream>
  countAll(query: ItemQuery): Promise<number>
  findContentSizeForComputingTransferLimit(query: ItemQuery): Promise<Array<{ uuid: string, contentSize: number | null }>>
  findDatesForComputingIntegrityHash(userUuid: string): Promise<Array<{ updated_at_timestamp: number }>>
  findByUuidAndUserUuid(uuid: string, userUuid: string): Promise<Item | undefined>
  findByUuid(uuid: string): Promise<Item | undefined>
  remove(item: Item): Promise<Item>
  save(item: Item): Promise<Item>
  markItemsAsDeleted(itemUuids: Array<string>, updatedAtTimestamp: number): Promise<void>
  updateContentSize(itemUuid: string, contentSize: number): Promise<void>
}
