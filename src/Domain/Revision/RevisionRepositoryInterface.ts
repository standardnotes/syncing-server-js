import { Revision } from './Revision'

export interface RevisionRepositoryInterface {
  findByItemId(itemId: string): Promise<Array<Revision>>
  findOneById(itemId: string, id: string): Promise<Revision | undefined>
  save(revision: Revision): Promise<Revision>
  removeByItem(itemUuid: string): Promise<void>
}
