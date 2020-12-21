import 'reflect-metadata'

import * as dayjs from 'dayjs'

import { SelectQueryBuilder, UpdateQueryBuilder } from 'typeorm'
import { User } from '../../Domain/User/User'

import { MySQLUserRepository } from './MySQLUserRepository'

describe('MySQLUserRepository', () => {
  let repository: MySQLUserRepository
  let queryBuilder: SelectQueryBuilder<User>
  let updateQueryBuilder: UpdateQueryBuilder<User>
  let user: User

  beforeEach(() => {
    queryBuilder = {} as jest.Mocked<SelectQueryBuilder<User>>
    updateQueryBuilder = {} as jest.Mocked<UpdateQueryBuilder<User>>

    user = {} as jest.Mocked<User>

    repository = new MySQLUserRepository()
    jest.spyOn(repository, 'createQueryBuilder')
    repository.createQueryBuilder = jest.fn().mockImplementation(() => queryBuilder)
  })

  it('should update lock counter by user id', async () => {
    repository.createQueryBuilder = jest.fn().mockImplementation(() => updateQueryBuilder)

    updateQueryBuilder.update = jest.fn().mockReturnThis()
    updateQueryBuilder.set = jest.fn().mockReturnThis()
    updateQueryBuilder.where = jest.fn().mockReturnThis()
    updateQueryBuilder.execute = jest.fn()

    await repository.updateLockCounter('123', 5)

    expect(updateQueryBuilder.update).toHaveBeenCalled()
    expect(updateQueryBuilder.set).toHaveBeenCalledWith(
      {
        numberOfFailedAttempts: 5
      }
    )
    expect(updateQueryBuilder.where).toHaveBeenCalledWith(
      'uuid = :uuid',
      { uuid: '123' }
    )
    expect(updateQueryBuilder.execute).toHaveBeenCalled()
  })

  it('should update locked until property', async () => {
    repository.createQueryBuilder = jest.fn().mockImplementation(() => updateQueryBuilder)

    updateQueryBuilder.update = jest.fn().mockReturnThis()
    updateQueryBuilder.set = jest.fn().mockReturnThis()
    updateQueryBuilder.where = jest.fn().mockReturnThis()
    updateQueryBuilder.execute = jest.fn()

    await repository.lockUntil('123', dayjs.utc('2030-01-01 10:00:00').toDate())

    expect(updateQueryBuilder.update).toHaveBeenCalled()
    expect(updateQueryBuilder.set).toHaveBeenCalledWith(
      {
        lockedUntil: dayjs.utc('2030-01-01 10:00:00').toDate(),
        numberOfFailedAttempts: 0
      }
    )
    expect(updateQueryBuilder.where).toHaveBeenCalledWith(
      'uuid = :uuid',
      { uuid: '123' }
    )
    expect(updateQueryBuilder.execute).toHaveBeenCalled()
  })

  it('should reset lock counter by user id', async () => {
    repository.createQueryBuilder = jest.fn().mockImplementation(() => updateQueryBuilder)

    updateQueryBuilder.update = jest.fn().mockReturnThis()
    updateQueryBuilder.set = jest.fn().mockReturnThis()
    updateQueryBuilder.where = jest.fn().mockReturnThis()
    updateQueryBuilder.execute = jest.fn()

    await repository.resetLockCounter('123')

    expect(updateQueryBuilder.update).toHaveBeenCalled()
    expect(updateQueryBuilder.set).toHaveBeenCalledWith(
      {
        lockedUntil: null,
        numberOfFailedAttempts: 0
      }
    )
    expect(updateQueryBuilder.where).toHaveBeenCalledWith(
      'uuid = :uuid',
      { uuid: '123' }
    )
    expect(updateQueryBuilder.execute).toHaveBeenCalled()
  })

  it('should find one user by id', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(user)

    const result = await repository.findOneByUuid('123')

    expect(queryBuilder.where).toHaveBeenCalledWith('user.uuid = :uuid', { uuid: '123' })
    expect(result).toEqual(user)
  })

  it('should find one user by email', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(user)

    const result = await repository.findOneByEmail('test@test.te')

    expect(queryBuilder.where).toHaveBeenCalledWith('user.email = :email', { email: 'test@test.te' })
    expect(result).toEqual(user)
  })
})
