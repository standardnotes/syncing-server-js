import { inject, injectable } from 'inversify'
import * as winston from 'winston'
import TYPES from '../../Bootstrap/Types'

import { Revision } from '../../Domain/Revision/Revision'
import { RevisionRepositoryInterface } from '../../Domain/Revision/RevisionRepositoryInterface'

@injectable()
export class InMemoryRevisionRepository implements RevisionRepositoryInterface {
  private revisions: Array<Revision> = []

  constructor(
    @inject(TYPES.Logger) private logger: winston.Logger,
  ) {
    const revision1 = new Revision()
    revision1.uuid = '123'
    revision1.itemUuid = '1'
    revision1.content = 'stub content 1'
    revision1.contentType = 'Note'
    revision1.itemsKeyId = '1'
    revision1.encItemKey = 'test'
    revision1.authHash = 'test'
    revision1.creationDate = new Date()
    revision1.createdAt = new Date()
    revision1.updatedAt = new Date
    this.revisions.push(revision1)

    const revision2 = new Revision()
    revision2.uuid = '234'
    revision2.itemUuid = '2'
    revision2.content = 'stub content 2'
    revision2.contentType = 'Note'
    revision2.itemsKeyId = '2'
    revision2.encItemKey = 'test 2'
    revision2.authHash = 'test 2'
    revision2.creationDate = new Date()
    revision2.createdAt = new Date()
    revision2.updatedAt = new Date
    this.revisions.push(revision2)
  }

  async findByItemId(itemId: string): Promise<Array<Revision>> {
    this.logger.info(`Searching for revisions on item ${itemId}`)

    return this.revisions.filter(revision => revision.itemUuid == itemId)
  }

  async findOneById(itemId: string, id:string): Promise<Revision | undefined> {
    return this.revisions.filter(revision => revision.itemUuid == itemId && revision.uuid == id).shift()
  }
}
