import { DomainEventHandlerInterface, ItemsContentSizeRecalculationRequestedEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { Stream } from 'stream'
import TYPES from '../../Bootstrap/Types'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'

@injectable()
export class ItemsContentSizeRecalculationRequestedEventHandler implements DomainEventHandlerInterface {
  constructor (
    @inject(TYPES.ItemRepository) private itemRepository: ItemRepositoryInterface,
  ) {
  }

  async handle(event: ItemsContentSizeRecalculationRequestedEvent): Promise<void> {
    const stream = await this.itemRepository.streamAll({
      userUuid: event.payload.userUuid,
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
    })

    stream.pipe(new Stream.Transform({
      objectMode: true,
      transform: async (item, _encoding, callback) => {
        const contentSize = item.content !== null ? Buffer.byteLength(item.content) : 0

        await this.itemRepository.updateContentSize(item.uuid, contentSize)

        callback()
      },
    }))
  }
}
