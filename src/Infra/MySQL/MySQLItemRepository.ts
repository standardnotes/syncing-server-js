import { injectable } from 'inversify'
import { EntityRepository, Repository } from 'typeorm'
import { Item } from '../../Domain/Item/Item'
import { ItemRepositoryInterface } from '../../Domain/Item/ItemRepositoryInterface'

@injectable()
@EntityRepository(Item)
export class MySQLItemRepository extends Repository<Item> implements ItemRepositoryInterface {
  async findMFAExtensionByUserUuid(userUuid: string): Promise<Item | undefined> {
    return this.createQueryBuilder('item')
      .where(
        'item.user_uuid = :user_uuid AND item.content_type = :content_type AND deleted = :deleted',
        {
          user_uuid: userUuid,
          content_type: 'SF|MFA',
          deleted: false
        }
      )
      .getOne()
  }
}
