import { injectable } from 'inversify'
import { EntityRepository, Repository } from 'typeorm'

import { ExtensionSetting } from '../../Domain/ExtensionSetting/ExtensionSetting'
import { ExtensionSettingRepositoryInterface } from '../../Domain/ExtensionSetting/ExtensionSettingRepositoryInterface'
@injectable()
@EntityRepository(ExtensionSetting)
export class MySQLExtensionSettingRepository extends Repository<ExtensionSetting> implements ExtensionSettingRepositoryInterface {
  async findOneByUuid(uuid: string): Promise<ExtensionSetting | undefined> {
    return this.createQueryBuilder('extension_setting')
      .where(
        'extension_setting.uuid = :uuid',
        {
          uuid,
        }
      )
      .getOne()
  }

  async findOneByExtensionId(extensionId: string): Promise<ExtensionSetting | undefined> {
    return this.createQueryBuilder('extension_setting')
      .where(
        'extension_setting.extension_id = :extensionId',
        {
          extensionId,
        }
      )
      .getOne()
  }
}
