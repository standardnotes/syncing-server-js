import { Item } from '../Item/Item'

export interface RevisionServiceInterface {
  createRevision(item: Item): Promise<void>
}
