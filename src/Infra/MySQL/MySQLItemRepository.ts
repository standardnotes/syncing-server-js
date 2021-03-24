import { injectable } from 'inversify'
import { EntityRepository, Repository } from 'typeorm'
import { Item } from '../../Domain/Item/Item'
import { ItemQuery } from '../../Domain/Item/ItemQuery'
import { ItemRepositoryInterface } from '../../Domain/Item/ItemRepositoryInterface'

@injectable()
@EntityRepository(Item)
export class MySQLItemRepository extends Repository<Item> implements ItemRepositoryInterface {
  async findByUuidAndUserUuid(_uuid: string, _userUuid: string): Promise<Item | undefined> {
    throw new Error('Method not implemented.')
  }

  async findAll(query: ItemQuery): Promise<Item[]> {
    const queryBuilder = this.createQueryBuilder('item')
    queryBuilder.where('item.user_uuid = :userUuid', { userUuid: query.userUuid })
    queryBuilder.orderBy(`item.${query.sortBy}`, query.sortOrder)
    if (query.deleted !== undefined) {
      queryBuilder.where('item.deleted = :deleted', { deleted: query.deleted })
    }
    if (query.contentType) {
      queryBuilder.where('item.content_type = :contentType', { contentType: query.contentType })
    }
    if (query.lastSyncTime && query.syncTimeComparison) {
      queryBuilder.where(`item.updated_at_timestamp ${query.syncTimeComparison} :lastSyncTime`, { lastSyncTime: query.lastSyncTime })
    }

    return queryBuilder.getMany()
  }

  async findMFAExtensionByUserUuid(userUuid: string): Promise<Item | undefined> {
    return this.createQueryBuilder('item')
      .where(
        'item.user_uuid = :user_uuid AND item.content_type = :content_type AND deleted = :deleted',
        {
          user_uuid: userUuid,
          content_type: 'SF|MFA',
          deleted: false
        }
      )
      .getOne()
  }
}
