import 'reflect-metadata'

import { SelectQueryBuilder } from 'typeorm'
import { RevokedSession } from '../../Domain/Session/RevokedSession'

import { MySQLRevokedSessionRepository } from './MySQLRevokedSessionRepository'

describe('MySQLRevokedSessionRepository', () => {
  let repository: MySQLRevokedSessionRepository
  let queryBuilder: SelectQueryBuilder<RevokedSession>
  let session: RevokedSession

  beforeEach(() => {
    queryBuilder = {} as jest.Mocked<SelectQueryBuilder<RevokedSession>>

    session = {} as jest.Mocked<RevokedSession>

    repository = new MySQLRevokedSessionRepository()
    jest.spyOn(repository, 'createQueryBuilder')
    repository.createQueryBuilder = jest.fn().mockImplementation(() => queryBuilder)
  })

  it('should find one session by id', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(session)

    const result = await repository.findOneByUuid('123')

    expect(queryBuilder.where).toHaveBeenCalledWith('revoked_session.uuid = :uuid', { uuid: '123' })
    expect(result).toEqual(session)
  })
})
