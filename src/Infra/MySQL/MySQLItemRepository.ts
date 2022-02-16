import { injectable } from 'inversify'
import { EntityRepository, Repository, SelectQueryBuilder } from 'typeorm'
import { Item } from '../../Domain/Item/Item'
import { ItemQuery } from '../../Domain/Item/ItemQuery'
import { ItemRepositoryInterface } from '../../Domain/Item/ItemRepositoryInterface'
import { ReadStream } from 'fs'
import { ItemIntegrityHash } from '../../Domain/Item/ItemIntegrityHash'

@injectable()
@EntityRepository(Item)
export class MySQLItemRepository extends Repository<Item> implements ItemRepositoryInterface {
  async updateContentSize(itemUuid: string, contentSize: number): Promise<void> {
    await this.createQueryBuilder('item')
      .update()
      .set({
        contentSize,
      })
      .where(
        'uuid = :itemUuid',
        {
          itemUuid,
        }
      )
      .execute()
  }

  async findContentSizeForComputingTransferLimit(query: ItemQuery): Promise<{ uuid: string; contentSize: number | null }[]> {
    const queryBuilder = this.createFindAllQueryBuilder(query)
    queryBuilder.select('item.uuid', 'uuid')
    queryBuilder.addSelect('item.content_size', 'contentSize')

    const items = await queryBuilder.getRawMany()

    return items
  }

  async deleteByUserUuid(userUuid: string): Promise<void> {
    await this.createQueryBuilder('item')
      .delete()
      .from('items')
      .where('user_uuid = :userUuid', { userUuid })
      .execute()
  }

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

  async findDatesForComputingIntegrityHash(userUuid: string): Promise<Array<{ updated_at_timestamp: number }>> {
    const queryBuilder = this.createQueryBuilder('item')
    queryBuilder.select('item.updated_at_timestamp')
    queryBuilder.where('item.user_uuid = :userUuid', { userUuid: userUuid })
    queryBuilder.andWhere('item.deleted = :deleted', { deleted: false })

    const items = await queryBuilder.getRawMany()

    return items
      .sort((itemA, itemB) => itemB.updated_at_timestamp - itemA.updated_at_timestamp)
  }

  async findItemsForComputingIntegrityHash(userUuid: string): Promise<ItemIntegrityHash[]> {
    const queryBuilder = this.createQueryBuilder('item')
    queryBuilder.select('item.uuid')
    queryBuilder.addSelect('item.updated_at_timestamp')
    queryBuilder.where('item.user_uuid = :userUuid', { userUuid: userUuid })
    queryBuilder.andWhere('item.deleted = :deleted', { deleted: false })

    const items = await queryBuilder.getRawMany()

    return items
      .sort((itemA, itemB) => itemB.updated_at_timestamp - itemA.updated_at_timestamp)
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
    return this.createFindAllQueryBuilder(query).getMany()
  }

  async streamAll(query: ItemQuery): Promise<ReadStream> {
    return this.createFindAllQueryBuilder(query).stream()
  }

  async countAll(query: ItemQuery): Promise<number> {
    return this.createFindAllQueryBuilder(query).getCount()
  }

  async markItemsAsDeleted(itemUuids: Array<string>, updatedAtTimestamp: number): Promise<void> {
    await this.createQueryBuilder('item')
      .update()
      .set({
        deleted: true,
        content: null,
        encItemKey: null,
        authHash: null,
        updatedAtTimestamp,
      })
      .where(
        'uuid IN (:...uuids)',
        {
          uuids: itemUuids,
        }
      )
      .execute()
  }

  private createFindAllQueryBuilder(query: ItemQuery): SelectQueryBuilder<Item> {
    const queryBuilder = this.createQueryBuilder('item')
    queryBuilder.orderBy(`item.${query.sortBy}`, query.sortOrder)

    if (query.userUuid !== undefined) {
      queryBuilder.where('item.user_uuid = :userUuid', { userUuid: query.userUuid })
    }
    if (query.uuids && query.uuids.length > 0) {
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

    return queryBuilder
  }
}
