import 'reflect-metadata'

import { SelectQueryBuilder, UpdateQueryBuilder } from 'typeorm'
import { RevokedSession } from '../../Domain/Session/RevokedSession'

import { MySQLRevokedSessionRepository } from './MySQLRevokedSessionRepository'

describe('MySQLRevokedSessionRepository', () => {
  let repository: MySQLRevokedSessionRepository
  let queryBuilder: SelectQueryBuilder<RevokedSession>
  let updateQueryBuilder: UpdateQueryBuilder<RevokedSession>
  let session: RevokedSession

  beforeEach(() => {
    queryBuilder = {} as jest.Mocked<SelectQueryBuilder<RevokedSession>>
    updateQueryBuilder = {} as jest.Mocked<UpdateQueryBuilder<RevokedSession>>

    session = {} as jest.Mocked<RevokedSession>

    repository = new MySQLRevokedSessionRepository()
    jest.spyOn(repository, 'createQueryBuilder')
    repository.createQueryBuilder = jest.fn().mockImplementation(() => queryBuilder)
  })

  it('should update retrieved property of a revoked session', async () => {
    repository.createQueryBuilder = jest.fn().mockImplementation(() => updateQueryBuilder)

    updateQueryBuilder.update = jest.fn().mockReturnThis()
    updateQueryBuilder.set = jest.fn().mockReturnThis()
    updateQueryBuilder.where = jest.fn().mockReturnThis()
    updateQueryBuilder.execute = jest.fn()

    await repository.updateRetrieved('1-2-3', true)

    expect(updateQueryBuilder.update).toHaveBeenCalled()
    expect(updateQueryBuilder.set).toHaveBeenCalledWith(
      {
        retrieved: true
      }
    )
    expect(updateQueryBuilder.where).toHaveBeenCalledWith(
      'uuid = :uuid',
      { uuid: '1-2-3' }
    )
    expect(updateQueryBuilder.execute).toHaveBeenCalled()
  })

  it('should find one session by id', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(session)

    const result = await repository.findOneByUuid('123')

    expect(queryBuilder.where).toHaveBeenCalledWith('revoked_session.uuid = :uuid', { uuid: '123' })
    expect(result).toEqual(session)
  })
})
