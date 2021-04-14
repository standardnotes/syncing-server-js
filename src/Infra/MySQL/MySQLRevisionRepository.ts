import { injectable } from 'inversify'
import { EntityRepository, Repository } from 'typeorm'
import { Revision } from '../../Domain/Revision/Revision'
import { RevisionRepositoryInterface } from '../../Domain/Revision/RevisionRepositoryInterface'

@injectable()
@EntityRepository(Revision)
export class MySQLRevisionRepository extends Repository<Revision> implements RevisionRepositoryInterface {
  async removeByItem(itemUuid: string): Promise<void> {
    await this.createQueryBuilder('revision')
      .delete()
      .from('revisions')
      .where('revision.item_uuid = :itemUuid', { itemUuid })
      .execute()

    await this.createQueryBuilder('item_revision')
      .delete()
      .from('item_revisions')
      .where('item_revision.item_uuid = :itemUuid', { itemUuid })
      .execute()
  }

  async findByItemId(itemId: string): Promise<Array<Revision>> {
    return this.createQueryBuilder('revision')
      .innerJoinAndSelect(
        'revision.items',
        'item',
        'item.uuid = :item_uuid',
        { item_uuid: itemId }
      )
      .orderBy('revision.created_at', 'DESC')
      .getMany()
  }

  async findOneById(itemId: string, id: string): Promise<Revision | undefined> {
    return this.createQueryBuilder('revision')
      .where('revision.uuid = :uuid', { uuid: id })
      .innerJoinAndSelect(
        'revision.items',
        'item',
        'item.uuid = :item_uuid',
        { item_uuid: itemId }
      )
      .getOne()
  }
}
