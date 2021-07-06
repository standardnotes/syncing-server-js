import 'reflect-metadata'

import { SelectQueryBuilder } from 'typeorm'
import { ContentType } from '../../Domain/Item/ContentType'
import { Item } from '../../Domain/Item/Item'

import { MySQLItemRepository } from './MySQLItemRepository'

describe('MySQLItemRepository', () => {
  let repository: MySQLItemRepository
  let queryBuilder: SelectQueryBuilder<Item>
  let item: Item

  beforeEach(() => {
    queryBuilder = {} as jest.Mocked<SelectQueryBuilder<Item>>

    item = {} as jest.Mocked<Item>

    repository = new MySQLItemRepository()
    jest.spyOn(repository, 'createQueryBuilder')
    repository.createQueryBuilder = jest.fn().mockImplementation(() => queryBuilder)
  })

  it('should find one MFA Extension item by user id', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(item)

    const result = await repository.findMFAExtensionByUserUuid('123')

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'item.user_uuid = :user_uuid AND item.content_type = :content_type AND deleted = :deleted',
      {
        user_uuid: '123',
        content_type: 'SF|MFA',
        deleted: false,
      }
    )
    expect(result).toEqual(item)
  })

  it('should delete MFA Extension item by user id', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.delete = jest.fn().mockReturnThis()
    queryBuilder.from = jest.fn().mockReturnThis()
    queryBuilder.execute = jest.fn()

    await repository.deleteMFAExtensionByUserUuid('123')

    expect(queryBuilder.delete).toHaveBeenCalled()
    expect(queryBuilder.from).toHaveBeenCalledWith('items')
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'user_uuid = :user_uuid AND content_type = :content_type',
      {
        user_uuid: '123',
        content_type: 'SF|MFA',
      }
    )
    expect(queryBuilder.execute).toHaveBeenCalled()
  })

  it('should find one item by uuid and user uuid', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(item)

    const result = await repository.findByUuidAndUserUuid('1-2-3', '2-3-4')

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'item.uuid = :uuid AND item.user_uuid = :userUuid',
      {
        uuid: '1-2-3',
        userUuid: '2-3-4',
      }
    )
    expect(result).toEqual(item)
  })

  it('should find one item by uuid', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(item)

    const result = await repository.findByUuid('1-2-3')

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'item.uuid = :uuid',
      {
        uuid: '1-2-3',
      }
    )
    expect(result).toEqual(item)
  })

  it('should find items by all query criteria filled in', async () => {
    queryBuilder.getMany = jest.fn().mockReturnValue([ item ])
    queryBuilder.where = jest.fn()
    queryBuilder.andWhere = jest.fn()
    queryBuilder.orderBy = jest.fn()
    queryBuilder.skip = jest.fn()
    queryBuilder.take = jest.fn()

    const result = await repository.findAll({
      userUuid: '1-2-3',
      sortBy: 'updated_at_timestamp',
      sortOrder: 'DESC',
      deleted: false,
      contentType: ContentType.Note,
      lastSyncTime: 123,
      syncTimeComparison: '>=',
      uuids: [ '2-3-4' ],
      offset: 1,
      limit: 10,
    })

    expect(queryBuilder.where).toHaveBeenCalledTimes(1)
    expect(queryBuilder.andWhere).toHaveBeenCalledTimes(4)
    expect(queryBuilder.where).toHaveBeenNthCalledWith(1, 'item.user_uuid = :userUuid', { userUuid: '1-2-3' })
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(1, 'item.uuid IN (:...uuids)', { uuids: [ '2-3-4' ] })
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(2, 'item.deleted = :deleted', { deleted: false })
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(3, 'item.content_type = :contentType', { contentType: 'Note' })
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(4, 'item.updated_at_timestamp >= :lastSyncTime', { lastSyncTime: 123 })
    expect(queryBuilder.skip).toHaveBeenCalledWith(1)
    expect(queryBuilder.take).toHaveBeenCalledWith(10)

    expect(queryBuilder.orderBy).toHaveBeenCalledWith('item.updated_at_timestamp', 'DESC')

    expect(result).toEqual([ item ])
  })

  it('should find items by only mandatory query criteria', async () => {
    queryBuilder.getMany = jest.fn().mockReturnValue([ item ])
    queryBuilder.where = jest.fn()
    queryBuilder.orderBy = jest.fn()

    const result = await repository.findAll({
      sortBy: 'updated_at_timestamp',
      sortOrder: 'DESC',
    })

    expect(queryBuilder.orderBy).toHaveBeenCalledWith('item.updated_at_timestamp', 'DESC')

    expect(result).toEqual([ item ])
  })

  it('should find dates for computing integrity hash', async () => {
    queryBuilder.getRawMany = jest.fn().mockReturnValue([ { updated_at_timestamp: 123 } ])
    queryBuilder.select = jest.fn()
    queryBuilder.where = jest.fn()
    queryBuilder.andWhere = jest.fn()
    queryBuilder.orderBy = jest.fn()

    const result = await repository.findDatesForComputingIntegrityHash('1-2-3')

    expect(queryBuilder.select).toHaveBeenCalledWith('item.updated_at_timestamp')
    expect(queryBuilder.where).toHaveBeenCalledTimes(1)
    expect(queryBuilder.where).toHaveBeenNthCalledWith(1, 'item.user_uuid = :userUuid', { userUuid: '1-2-3' })
    expect(queryBuilder.andWhere).toHaveBeenCalledTimes(2)
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(1, 'item.deleted = :deleted', { deleted: false })
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(2, 'item.content_type IS NOT NULL')
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('item.updated_at_timestamp', 'DESC')

    expect(result).toEqual([ 123 ])
  })
})
