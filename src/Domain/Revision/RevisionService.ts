import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { ContentType } from '../Item/ContentType'
import { Item } from '../Item/Item'
import { ItemRevision } from './ItemRevision'
import { ItemRevisionRepositoryInterface } from './ItemRevisionRepositoryInterface'
import { Revision } from './Revision'
import { RevisionRepositoryInterface } from './RevisionRepositoryInterface'
import { RevisionServiceInterface } from './RevisionServiceInterface'

@injectable()
export class RevisionService implements RevisionServiceInterface {
  constructor (
    @inject(TYPES.RevisionRepository) private revisionRepository: RevisionRepositoryInterface,
    @inject(TYPES.ItemRevisionRepository) private itemRevisionRepository: ItemRevisionRepositoryInterface,
  ) {
  }

  async copyRevisions(fromItemUuid: string, toItemUuid: string): Promise<void> {
    const itemRevisions = await this.itemRevisionRepository.findByItem(fromItemUuid)

    for (const itemRevision of itemRevisions) {
      const itemRevisionCopy = new ItemRevision()
      itemRevisionCopy.itemUuid = toItemUuid
      itemRevisionCopy.revisionUuid = itemRevision.revisionUuid

      await this.itemRevisionRepository.save(itemRevisionCopy)
    }
  }

  async deleteRevisionsForItem(item: Item): Promise<void> {
    await this.revisionRepository.removeByItem(item.uuid)

    await this.itemRevisionRepository.removeByItem(item.uuid)
  }

  async createRevision(item: Item): Promise<void> {
    if (item.contentType !== ContentType.Note) {
      return
    }

    const now = new Date()

    const revision = new Revision()
    revision.authHash = item.authHash
    revision.content = item.content
    revision.contentType = item.contentType
    revision.encItemKey = item.encItemKey
    revision.itemUuid = item.uuid
    revision.itemsKeyId = item.itemsKeyId
    revision.creationDate = now
    revision.createdAt = now
    revision.updatedAt = now

    const savedRevision = await this.revisionRepository.save(revision)

    const itemRevision = new ItemRevision()
    itemRevision.itemUuid = item.uuid
    itemRevision.revisionUuid = savedRevision.uuid

    await this.itemRevisionRepository.save(itemRevision)
  }
}
