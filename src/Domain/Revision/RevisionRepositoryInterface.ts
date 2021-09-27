import { Revision } from './Revision'

export interface RevisionRepositoryInterface {
  findByItemId(parameters: {
    itemUuid: string,
    afterDate?: Date,
  }): Promise<Array<Revision>>
  findOneById(itemId: string, id: string): Promise<Revision | undefined>
  save(revision: Revision): Promise<Revision>
}
