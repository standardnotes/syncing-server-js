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
    queryBuilder.innerJoin = jest.fn().mockReturnThis()
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getMany = jest.fn().mockReturnValue([revision])

    const result = await repository.findByItemId('123')

    expect(queryBuilder.innerJoin).toHaveBeenCalledWith(
      'item_revisions',
      'ir',
      'ir.item_uuid = revision:item_uuid'
    )
    expect(queryBuilder.where).toHaveBeenCalledWith('ir.item_uuid = :item_uuid', { item_uuid: '123' })
    expect(result).toEqual([revision])
  })

  it('should find one revision by id and item id', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.andWhere = jest.fn().mockReturnThis()
    queryBuilder.innerJoin = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(revision)

    const result = await repository.findOneById('123', '234')

    expect(queryBuilder.where).toHaveBeenCalledWith('revision.uuid = :uuid', { uuid: '234' })
    expect(queryBuilder.innerJoin).toHaveBeenCalledWith(
      'item_revisions',
      'ir',
      'ir.item_uuid = revision:item_uuid'
    )
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('ir.item_uuid = :item_uuid', { item_uuid: '123' })
    expect(result).toEqual(revision)
  })
})
