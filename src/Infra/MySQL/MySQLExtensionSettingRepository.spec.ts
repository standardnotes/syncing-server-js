import 'reflect-metadata'

import { SelectQueryBuilder } from 'typeorm'
import { ExtensionSetting } from '../../Domain/ExtensionSetting/ExtensionSetting'

import { MySQLExtensionSettingRepository } from './MySQLExtensionSettingRepository'

describe('MySQLExtensionSettingRepository', () => {
  let repository: MySQLExtensionSettingRepository
  let queryBuilder: SelectQueryBuilder<ExtensionSetting>
  let extensionSetting: ExtensionSetting

  beforeEach(() => {
    queryBuilder = {} as jest.Mocked<SelectQueryBuilder<ExtensionSetting>>

    extensionSetting = {} as jest.Mocked<ExtensionSetting>

    repository = new MySQLExtensionSettingRepository()
    jest.spyOn(repository, 'createQueryBuilder')
    repository.createQueryBuilder = jest.fn().mockImplementation(() => queryBuilder)
  })

  it('should find one extension setting by id', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(extensionSetting)

    const result = await repository.findOneByExtensionId('123')

    expect(queryBuilder.where).toHaveBeenCalledWith('extension_setting.extension_id = :extensionId', { extensionId: '123' })
    expect(result).toEqual(extensionSetting)
  })

  it('should find one extension setting by uuid', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(extensionSetting)

    const result = await repository.findOneByUuid('123')

    expect(queryBuilder.where).toHaveBeenCalledWith('extension_setting.uuid = :uuid', { uuid: '123' })
    expect(result).toEqual(extensionSetting)
  })
})
