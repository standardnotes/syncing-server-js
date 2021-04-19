import 'reflect-metadata'

import './tracer'

import { Logger } from 'winston'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { ItemRepositoryInterface } from '../src/Domain/Item/ItemRepositoryInterface'
import { ContentType } from '../src/Domain/Item/ContentType'
import { ContentDecoderInterface } from '../src/Domain/Item/ContentDecoderInterface'
import { Frequency } from '../src/Domain/ExtensionSetting/Frequency'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { ContentSubtype } from '../src/Domain/Item/ContentSubtype'
import { DomainEventFactoryInterface } from '../src/Domain/Event/DomainEventFactoryInterface'

const inputArgs = process.argv.slice(2)
const muteEmails = inputArgs[0] === 'mute-emails'

const runDailyBackup = async (
  itemRepository: ItemRepositoryInterface,
  contentDecoder: ContentDecoderInterface,
  domainEventFactory: DomainEventFactoryInterface,
  domainEventPublisher: DomainEventPublisherInterface,
): Promise<void> => {
  let offset = 0
  const limit = 100
  let fetchedItemsCount = 0

  do {
    const fetchedItems = await itemRepository.findAll({
      deleted: false,
      contentType: ContentType.ServerExtension,
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
      offset,
      limit,
    })
    fetchedItemsCount = fetchedItems.length

    for (const fetchedItem of fetchedItems) {
      if (!fetchedItem.content || fetchedItem.userUuid) {
        continue
      }

      const decodedContent = contentDecoder.decode(fetchedItem.content)

      if (!('frequency' in decodedContent) || decodedContent.frequency !== Frequency.Daily) {
        continue
      }

      if ('subtype' in decodedContent && decodedContent.subtype === ContentSubtype.BackupEmailArchive) {
        if(muteEmails) {
          continue
        }

        await domainEventPublisher.publish(
          domainEventFactory.createEmailArchiveExtensionSyncedEvent(
            fetchedItem.userUuid,
            fetchedItem.uuid,
          )
        )

        continue
      }

      if (!('url' in decodedContent) || !decodedContent.url) {
        continue
      }

      await domainEventPublisher.publish(
        domainEventFactory.createItemsSyncedEvent({
          userUuid: fetchedItem.userUuid,
          extensionUrl: <string> decodedContent.url,
          extensionId: fetchedItem.uuid,
          itemUuids: [],
          forceMute: muteEmails,
        })
      )
    }

    offset += limit
  } while (fetchedItemsCount === limit)
}

const container = new ContainerConfigLoader
void container.load().then(container => {
  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Logger)

  logger.info('Starting daily backup...')

  const itemRepository: ItemRepositoryInterface = container.get(TYPES.ItemRepository)
  const contentDecoder: ContentDecoderInterface = container.get(TYPES.ContentDecoder)
  const domainEventFactory: DomainEventFactoryInterface = container.get(TYPES.DomainEventFactory)
  const domainEventPublisher: DomainEventPublisherInterface = container.get(TYPES.DomainEventPublisher)

  Promise
    .resolve(runDailyBackup(itemRepository, contentDecoder, domainEventFactory, domainEventPublisher))
    .then(() => logger.info('Daily backup complete'))
    .catch((error) => logger.error(`Could not finish daily backup: ${error.message}`))
})
