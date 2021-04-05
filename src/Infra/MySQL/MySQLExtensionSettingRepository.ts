import { Repository } from 'typeorm'

import { ExtensionSetting } from '../../Domain/ExtensionSetting/ExtensionSetting'
import { ExtensionSettingRepositoryInterface } from '../../Domain/ExtensionSetting/ExtensionSettingRepositoryInterface'

export class MySQLExtensionSettingRepository extends Repository<ExtensionSetting> implements ExtensionSettingRepositoryInterface {
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
