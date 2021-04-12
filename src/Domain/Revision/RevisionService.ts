import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { ContentType } from '../Item/ContentType'
import { Item } from '../Item/Item'
import { Revision } from './Revision'
import { RevisionRepositoryInterface } from './RevisionRepositoryInterface'
import { RevisionServiceInterface } from './RevisionServiceInterface'

@injectable()
export class RevisionService implements RevisionServiceInterface {
  constructor (
    @inject(TYPES.RevisionRepository) private revisionsRepository: RevisionRepositoryInterface,
  ) {
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
    revision.items = Promise.resolve([ item ])
    revision.creationDate = now
    revision.createdAt = now
    revision.updatedAt = now

    await this.revisionsRepository.save(revision)
  }
}
