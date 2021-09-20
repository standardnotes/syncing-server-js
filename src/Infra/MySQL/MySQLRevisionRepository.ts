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
      .where('item_uuid = :itemUuid', { itemUuid })
      .execute()
  }

  async findByItemId(parameters: {
    itemUuid: string,
    afterDate?: Date,
  }): Promise<Array<Revision>> {
    const queryBuilder = this.createQueryBuilder('revision')
      .where(
        'revision.item_uuid = :item_uuid',
        { item_uuid: parameters.itemUuid }
      )

    if (parameters.afterDate !== undefined) {
      queryBuilder.andWhere(
        'revision.creation_date >= :after_date',
        { after_date: parameters.afterDate }
      )
    }

    return queryBuilder
      .orderBy('revision.created_at', 'DESC')
      .getMany()
  }

  async findOneById(itemId: string, id: string): Promise<Revision | undefined> {
    return this.createQueryBuilder('revision')
      .where(
        'revision.uuid = :uuid AND revision.item_uuid = :item_uuid',
        { uuid: id, item_uuid: itemId })
      .getOne()
  }
}
