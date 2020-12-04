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

  it('should find active sessions by user id', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getMany = jest.fn().mockReturnValue([session])

    const result = await repository.findActiveByUserUuid('123')

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'session.refresh_expiration > :refresh_expiration AND session.user_uuid = :user_uuid',
      { refresh_expiration: expect.any(Date), user_uuid: '123' }
    )
    expect(result).toEqual([session])
  })

  it('should find one session by id', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(session)

    const result = await repository.findOneByUuid('123')

    expect(queryBuilder.where).toHaveBeenCalledWith('session.uuid = :uuid', { uuid: '123' })
    expect(result).toEqual(session)
  })

  it('should find one session by id and user id', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(session)

    const result = await repository.findOneByUuidAndUserUuid('123', '234')

    expect(queryBuilder.where).toHaveBeenCalledWith('session.uuid = :uuid AND session.user_uuid = :user_uuid', { uuid: '123', user_uuid: '234' })
    expect(result).toEqual(session)
  })

  it('should delete all session for a user except the current one', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.delete = jest.fn().mockReturnThis()
    queryBuilder.execute = jest.fn()

    await repository.deleteAllByUserUuidExceptOne('123', '234')

    expect(queryBuilder.delete).toHaveBeenCalled()
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'session.user_uuid = :user_uuid AND session.uuid != :current_session_uuid',
      {
        user_uuid: '123',
        current_session_uuid: '234'
      }
    )
    expect(queryBuilder.execute).toHaveBeenCalled()
  })

  it('should delete one session by id', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.delete = jest.fn().mockReturnThis()
    queryBuilder.execute = jest.fn()

    await repository.deleteOneByUuid('123')

    expect(queryBuilder.delete).toHaveBeenCalled()
    expect(queryBuilder.where).toHaveBeenCalledWith('session.uuid = :uuid', { uuid: '123' })
    expect(queryBuilder.execute).toHaveBeenCalled()
  })
})
