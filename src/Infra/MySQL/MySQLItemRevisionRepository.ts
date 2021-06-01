import { injectable } from 'inversify'
import { EntityRepository, Repository } from 'typeorm'
import { ItemRevision } from '../../Domain/Revision/ItemRevision'
import { ItemRevisionRepositoryInterface } from '../../Domain/Revision/ItemRevisionRepositoryInterface'

@injectable()
@EntityRepository(ItemRevision)
export class MySQLItemRevisionRepository extends Repository<ItemRevision> implements ItemRevisionRepositoryInterface {
  async findByItem(itemUuid: string): Promise<ItemRevision[]> {
    return this.createQueryBuilder('item_revision')
      .where('item_revision.item_uuid = :itemUuid', { itemUuid })
      .getMany()
  }

  async removeByItem(itemUuid: string): Promise<void> {
    await this.createQueryBuilder('item_revision')
      .delete()
      .from('item_revisions')
      .where('item_uuid = :itemUuid', { itemUuid })
      .execute()
  }
}
