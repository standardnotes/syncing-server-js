import { Item } from '../Item/Item'

export interface RevisionServiceInterface {
  createRevision(item: Item): Promise<void>
  copyRevisions(fromItemUuid: string, toItemUuid: string): Promise<void>
  deleteRevisionsForItem(item: Item): Promise<void>
}
