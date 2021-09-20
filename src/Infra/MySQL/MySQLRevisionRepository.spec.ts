import 'reflect-metadata'

import { SelectQueryBuilder } from 'typeorm'
import { Revision } from '../../Domain/Revision/Revision'

import { MySQLRevisionRepository } from './MySQLRevisionRepository'

describe('MySQLRevisionRepository', () => {
  let repository: MySQLRevisionRepository
  let queryBuilder: SelectQueryBuilder<Revision>
  let revision: Revision

  beforeEach(() => {
    queryBuilder = {} as jest.Mocked<SelectQueryBuilder<Revision>>

    revision = {} as jest.Mocked<Revision>

    repository = new MySQLRevisionRepository()
    jest.spyOn(repository, 'createQueryBuilder')
    repository.createQueryBuilder = jest.fn().mockImplementation(() => queryBuilder)
  })

  it('should find revisions by item id', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.orderBy = jest.fn().mockReturnThis()
    queryBuilder.getMany = jest.fn().mockReturnValue([revision])

    const result = await repository.findByItemId({ itemUuid: '123' })

    expect(queryBuilder.where).toHaveBeenCalledWith('revision.item_uuid = :item_uuid', { item_uuid: '123' })
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('revision.created_at', 'DESC')
    expect(result).toEqual([revision])
  })

  it('should find revisions by item id after certain date', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.andWhere = jest.fn().mockReturnThis()
    queryBuilder.orderBy = jest.fn().mockReturnThis()
    queryBuilder.getMany = jest.fn().mockReturnValue([revision])

    const result = await repository.findByItemId({ itemUuid: '123', afterDate: new Date(2) })

    expect(queryBuilder.where).toHaveBeenCalledWith('revision.item_uuid = :item_uuid', { item_uuid: '123' })
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('revision.creation_date >= :after_date', { after_date: new Date(2) })
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('revision.created_at', 'DESC')
    expect(result).toEqual([revision])
  })

  it('should find one revision by id and item id', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(revision)

    const result = await repository.findOneById('123', '234')

    expect(queryBuilder.where).toHaveBeenCalledWith('revision.uuid = :uuid AND revision.item_uuid = :item_uuid', { uuid: '234', item_uuid: '123' })
    expect(result).toEqual(revision)
  })

  it('should delete all revisions for a given item', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.delete = jest.fn().mockReturnThis()
    queryBuilder.from = jest.fn().mockReturnThis()
    queryBuilder.execute = jest.fn()

    await repository.removeByItem('123')

    expect(queryBuilder.delete).toHaveBeenCalled()

    expect(queryBuilder.from).toHaveBeenCalledWith('revisions')
    expect(queryBuilder.where).toHaveBeenCalledWith('item_uuid = :itemUuid', { itemUuid: '123' })

    expect(queryBuilder.execute).toHaveBeenCalled()
  })
})
