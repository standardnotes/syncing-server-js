import 'reflect-metadata'

import { SelectQueryBuilder } from 'typeorm'
import { Session } from '../../Domain/Session/Session'

import { MySQLSessionRepository } from './MySQLSessionRepository'

describe('MySQLSessionRepository', () => {
  let repository: MySQLSessionRepository
  let queryBuilder: SelectQueryBuilder<Session>
  let session: Session

  beforeEach(() => {
    queryBuilder = {} as jest.Mocked<SelectQueryBuilder<Session>>

    session = {} as jest.Mocked<Session>

    repository = new MySQLSessionRepository()
    jest.spyOn(repository, 'createQueryBuilder')
    repository.createQueryBuilder = jest.fn().mockImplementation(() => queryBuilder)
  })

  it('should find one session by id', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(session)

    const result = await repository.findOneByUuid('123')

    expect(queryBuilder.where).toHaveBeenCalledWith('session.uuid = :uuid', { uuid: '123' })
    expect(result).toEqual(session)
  })
})
