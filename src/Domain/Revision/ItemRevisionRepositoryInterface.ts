import { ItemRevision } from './ItemRevision'

export interface ItemRevisionRepositoryInterface {
  findByItem(itemUuid: string): Promise<ItemRevision[]>
  removeByItem(itemUuid: string): Promise<void>
  save(itemRevision: ItemRevision): Promise<ItemRevision>
}
