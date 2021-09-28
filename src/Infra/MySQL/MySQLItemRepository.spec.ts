import 'reflect-metadata'

import { SelectQueryBuilder } from 'typeorm'
import { ContentType } from '@standardnotes/common'

import { Item } from '../../Domain/Item/Item'

import { MySQLItemRepository } from './MySQLItemRepository'
import { TimerInterface } from '@standardnotes/time'

describe('MySQLItemRepository', () => {
  let repository: MySQLItemRepository
  let queryBuilder: SelectQueryBuilder<Item>
  let item: Item
  let timer: TimerInterface

  beforeEach(() => {
    queryBuilder = {} as jest.Mocked<SelectQueryBuilder<Item>>

    item = {} as jest.Mocked<Item>
    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn(() => 1616161616161616)

    repository = new MySQLItemRepository()
    jest.spyOn(repository, 'createQueryBuilder')
    repository.createQueryBuilder = jest.fn().mockImplementation(() => queryBuilder)
  })

  it('should delete all items for a given user', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.delete = jest.fn().mockReturnThis()
    queryBuilder.from = jest.fn().mockReturnThis()
    queryBuilder.execute = jest.fn()

    await repository.deleteByUserUuid('123')

    expect(queryBuilder.delete).toHaveBeenCalled()

    expect(queryBuilder.from).toHaveBeenCalledWith('items')
    expect(queryBuilder.where).toHaveBeenCalledWith('user_uuid = :userUuid', { userUuid: '123' })

    expect(queryBuilder.execute).toHaveBeenCalled()
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

  it('should find items with count by all query criteria filled in', async () => {
    queryBuilder.getManyAndCount = jest.fn().mockReturnValue([ [ item ], 1 ])
    queryBuilder.where = jest.fn()
    queryBuilder.andWhere = jest.fn()
    queryBuilder.orderBy = jest.fn()
    queryBuilder.skip = jest.fn()
    queryBuilder.take = jest.fn()

    const result = await repository.findAllAndCount({
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

    expect(result).toEqual([ [ item ], 1 ])
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
    queryBuilder.getRawMany = jest.fn().mockReturnValue([
      { updated_at_timestamp: 1616164633241312, content_type: ContentType.Note },
      { updated_at_timestamp: 1616164633242313, content_type: null },
      { updated_at_timestamp: 1616164633242313, content_type: ContentType.ServerExtension },
    ])
    queryBuilder.select = jest.fn()
    queryBuilder.addSelect = jest.fn()
    queryBuilder.where = jest.fn()
    queryBuilder.andWhere = jest.fn()

    const result = await repository.findDatesForComputingIntegrityHash('1-2-3')

    expect(queryBuilder.select).toHaveBeenCalledWith('item.updated_at_timestamp')
    expect(queryBuilder.where).toHaveBeenCalledTimes(1)
    expect(queryBuilder.where).toHaveBeenNthCalledWith(1, 'item.user_uuid = :userUuid', { userUuid: '1-2-3' })
    expect(queryBuilder.andWhere).toHaveBeenCalledTimes(1)
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(1, 'item.deleted = :deleted', { deleted: false })

    expect(result.length).toEqual(2)
    expect(result[0]).toEqual({ content_type: 'SF|Extension', updated_at_timestamp: 1616164633242313 })
    expect(result[1]).toEqual({ content_type: 'Note', updated_at_timestamp: 1616164633241312 })
  })

  it('should find item by uuid and mark it for deletion', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.update = jest.fn().mockReturnThis()
    queryBuilder.update().set = jest.fn().mockReturnThis()
    queryBuilder.execute = jest.fn()

    const item = { uuid: 'e-1-2-3' } as jest.Mocked<Item>
    const updatedAtTimestamp = timer.getTimestampInMicroseconds()
    await repository.markItemsAsDeleted([item.uuid], updatedAtTimestamp)

    expect(queryBuilder.update).toHaveBeenCalled()
    expect(queryBuilder.update().set).toHaveBeenCalledWith(expect.objectContaining({
      deleted: true,
      content: null,
      encItemKey: null,
      authHash: null,
      updatedAtTimestamp: expect.anything(),
    }))
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'uuid IN (:...uuids)',
      {
        uuids: ['e-1-2-3'],
      }
    )
    expect(queryBuilder.execute).toHaveBeenCalled()
  })
})
