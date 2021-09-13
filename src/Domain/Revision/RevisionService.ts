
import { inject, injectable } from 'inversify'
import { ContentType } from '@standardnotes/common'

import TYPES from '../../Bootstrap/Types'
import { Item } from '../Item/Item'
import { Revision } from './Revision'
import { RevisionRepositoryInterface } from './RevisionRepositoryInterface'
import { RevisionServiceInterface } from './RevisionServiceInterface'

@injectable()
export class RevisionService implements RevisionServiceInterface {
  constructor (
    @inject(TYPES.RevisionRepository) private revisionRepository: RevisionRepositoryInterface,
  ) {
  }

  async copyRevisions(fromItemUuid: string, toItemUuid: string): Promise<void> {
    const revisions = await this.revisionRepository.findByItemId(fromItemUuid)

    for (const existingRevision of revisions) {
      const revisionCopy = Object.assign({}, existingRevision, { uuid: undefined, itemUuid: toItemUuid })

      await this.revisionRepository.save(revisionCopy)
    }
  }

  async deleteRevisionsForItem(item: Item): Promise<void> {
    await this.revisionRepository.removeByItem(item.uuid)
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

    await this.revisionRepository.save(revision)
  }
}
