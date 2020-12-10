import 'reflect-metadata'

import { SelectQueryBuilder } from 'typeorm'
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
        deleted: false
      }
    )
    expect(result).toEqual(item)
  })
})
