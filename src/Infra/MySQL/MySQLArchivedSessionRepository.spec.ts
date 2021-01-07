import 'reflect-metadata'

import { SelectQueryBuilder } from 'typeorm'
import { ArchivedSession } from '../../Domain/Session/ArchivedSession'

import { MySQLArchivedSessionRepository } from './MySQLArchivedSessionRepository'

describe('MySQLArchivedSessionRepository', () => {
  let repository: MySQLArchivedSessionRepository
  let queryBuilder: SelectQueryBuilder<ArchivedSession>
  let session: ArchivedSession

  beforeEach(() => {
    queryBuilder = {} as jest.Mocked<SelectQueryBuilder<ArchivedSession>>

    session = {} as jest.Mocked<ArchivedSession>

    repository = new MySQLArchivedSessionRepository()
    jest.spyOn(repository, 'createQueryBuilder')
    repository.createQueryBuilder = jest.fn().mockImplementation(() => queryBuilder)
  })


  it('should find one session by id', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(session)

    const result = await repository.findOneByUuid('123')

    expect(queryBuilder.where).toHaveBeenCalledWith('archived_session.uuid = :uuid', { uuid: '123' })
    expect(result).toEqual(session)
  })
})
