import { Item } from '../Item/Item'
import { Revision } from './Revision'

export interface RevisionServiceInterface {
  createRevision(item: Item): Promise<void>
  copyRevisions(fromItemUuid: string, toItemUuid: string): Promise<void>
  deleteRevisionsForItem(item: Item): Promise<void>
  getRevisions(userUuid: string, itemUuid: string): Promise<Revision[]>
}
