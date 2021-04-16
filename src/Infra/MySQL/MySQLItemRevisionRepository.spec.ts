import 'reflect-metadata'

import { SelectQueryBuilder } from 'typeorm'
import { ItemRevision } from '../../Domain/Revision/ItemRevision'

import { MySQLItemRevisionRepository } from './MySQLItemRevisionRepository'

describe('MySQLItemRevisionRepository', () => {
  let repository: MySQLItemRevisionRepository
  let queryBuilder: SelectQueryBuilder<ItemRevision>

  beforeEach(() => {
    queryBuilder = {} as jest.Mocked<SelectQueryBuilder<ItemRevision>>

    repository = new MySQLItemRevisionRepository()
    jest.spyOn(repository, 'createQueryBuilder')
    repository.createQueryBuilder = jest.fn().mockImplementation(() => queryBuilder)
  })

  it('should find all item_revisions for a given item', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getMany = jest.fn().mockReturnValue([])

    expect(await repository.findByItem('123')).toEqual([])

    expect(queryBuilder.where).toHaveBeenCalledWith('item_revision.item_uuid = :itemUuid', { itemUuid: '123' })

    expect(queryBuilder.getMany).toHaveBeenCalled()
  })

  it('should delete all item_revisions for a given item', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.delete = jest.fn().mockReturnThis()
    queryBuilder.from = jest.fn().mockReturnThis()
    queryBuilder.execute = jest.fn()

    await repository.removeByItem('123')

    expect(queryBuilder.delete).toHaveBeenCalled()

    expect(queryBuilder.from).toHaveBeenCalledWith('item_revisions')
    expect(queryBuilder.where).toHaveBeenCalledWith('item_revision.item_uuid = :itemUuid', { itemUuid: '123' })

    expect(queryBuilder.execute).toHaveBeenCalled()
  })
})
