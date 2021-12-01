import { DomainEventHandlerInterface, ItemsContentSizeRecalculationRequestedEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { Stream } from 'stream'
import { ReadStream } from 'fs'
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

    await this.handleStream(stream)
  }

  private async handleStream(stream: ReadStream): Promise<void> {
    return new Promise((resolve, reject) => {
      stream.pipe(new Stream.Transform({
        objectMode: true,
        transform: async (item, _encoding, callback) => {
          const contentSize = item.item_content !== null ? Buffer.byteLength(item.item_content) : 0

          await this.itemRepository.updateContentSize(item.item_uuid, contentSize)

          callback()
        },
      }))
        .on('finish', resolve)
        .on('error', reject)
    })
  }
}