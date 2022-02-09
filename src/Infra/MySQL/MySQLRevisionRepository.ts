import { injectable } from 'inversify'
import { EntityRepository, Repository } from 'typeorm'
import { Revision } from '../../Domain/Revision/Revision'
import { RevisionRepositoryInterface } from '../../Domain/Revision/RevisionRepositoryInterface'

@injectable()
@EntityRepository(Revision)
export class MySQLRevisionRepository extends Repository<Revision> implements RevisionRepositoryInterface {
  async removeByUuid(itemUuid: string, revisionUuid: string): Promise<void> {
    await this.createQueryBuilder('revision')
      .delete()
      .from('revisions')
      .where('uuid = :revisionUuid AND item_uuid = :itemUuid', { itemUuid, revisionUuid })
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
