import { injectable } from 'inversify'
import { EntityRepository, Repository } from 'typeorm'
import { Revision } from '../../Domain/Revision/Revision'
import { RevisionRepositoryInterface } from '../../Domain/Revision/RevisionRepositoryInterface'

@injectable()
@EntityRepository(Revision)
export class MySQLRevisionRepository extends Repository<Revision> implements RevisionRepositoryInterface {
  async findByItemId(itemId: string): Promise<Array<Revision>> {
    return this.createQueryBuilder('revision')
      .innerJoinAndSelect(
        'revision.items',
        'item',
        'item.uuid = :item_uuid',
        { item_uuid: itemId }
      )
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
