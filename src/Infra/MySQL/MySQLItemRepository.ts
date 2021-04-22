import { injectable } from 'inversify'
import { EntityRepository, Repository } from 'typeorm'
import { Item } from '../../Domain/Item/Item'
import { ItemQuery } from '../../Domain/Item/ItemQuery'
import { ItemRepositoryInterface } from '../../Domain/Item/ItemRepositoryInterface'

@injectable()
@EntityRepository(Item)
export class MySQLItemRepository extends Repository<Item> implements ItemRepositoryInterface {
  async findByUuid(uuid: string): Promise<Item | undefined> {
    return this.createQueryBuilder('item')
      .where(
        'item.uuid = :uuid',
        {
          uuid,
        }
      )
      .getOne()
  }

  async findDatesForComputingIntegrityHash(userUuid: string): Promise<number[]> {
    const queryBuilder = this.createQueryBuilder('item')
    queryBuilder.select('item.updated_at_timestamp')
    queryBuilder.where('item.user_uuid = :userUuid', { userUuid: userUuid })
    queryBuilder.andWhere('item.deleted = :deleted', { deleted: false })
    queryBuilder.andWhere('item.content_type IS NOT NULL')
    queryBuilder.orderBy('item.updated_at_timestamp', 'DESC')

    const items = await queryBuilder.getRawMany()

    return items.map(item => item.updated_at_timestamp)
  }

  async findByUuidAndUserUuid(uuid: string, userUuid: string): Promise<Item | undefined> {
    return this.createQueryBuilder('item')
      .where(
        'item.uuid = :uuid AND item.user_uuid = :userUuid',
        {
          uuid,
          userUuid,
        }
      )
      .getOne()
  }

  async findAll(query: ItemQuery): Promise<Item[]> {
    const queryBuilder = this.createQueryBuilder('item')
    queryBuilder.orderBy(`item.${query.sortBy}`, query.sortOrder)

    if (query.userUuid !== undefined) {
      queryBuilder.where('item.user_uuid = :userUuid', { userUuid: query.userUuid })
    }
    if (query.uuids) {
      queryBuilder.andWhere('item.uuid IN (:...uuids)', { uuids: query.uuids })
    }
    if (query.deleted !== undefined) {
      queryBuilder.andWhere('item.deleted = :deleted', { deleted: query.deleted })
    }
    if (query.contentType) {
      queryBuilder.andWhere('item.content_type = :contentType', { contentType: query.contentType })
    }
    if (query.lastSyncTime && query.syncTimeComparison) {
      queryBuilder.andWhere(`item.updated_at_timestamp ${query.syncTimeComparison} :lastSyncTime`, { lastSyncTime: query.lastSyncTime })
    }
    if (query.offset !== undefined) {
      queryBuilder.skip(query.offset)
    }
    if (query.limit !== undefined) {
      queryBuilder.take(query.limit)
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
          deleted: false,
        }
      )
      .getOne()
  }
}
