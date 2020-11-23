import { inject, injectable } from 'inversify'
import * as winston from 'winston'
import TYPES from '../../Bootstrap/Types'

import { Revision } from '../../Domain/Revision/Revision'
import { RevisionRepositoryInterface } from '../../Domain/Revision/RevisionRepositoryInterface'

@injectable()
export class InMemoryRevisionRepository implements RevisionRepositoryInterface {
  private logger: winston.Logger

  constructor(
    @inject(TYPES.LoggerFactory) loggerFactory: () => winston.Logger,
  ) {
    this.logger = loggerFactory()
  }
  private revisions: Array<Revision> = [
    {
      uuid: '123',
      itemUuid: '1',
      content: 'stub content 1',
      contentType: 'Note',
      itemsKeyId: '1',
      encItemKey: 'test',
      authHash: 'test',
      creationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date
    },
    {
      uuid: '234',
      itemUuid: '2',
      content: 'stub content 2',
      contentType: 'Note',
      itemsKeyId: '2',
      encItemKey: 'test 2',
      authHash: 'test 2',
      creationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date
    }
  ]

  async findByItemId(itemId: string): Promise<Array<Revision>> {
    this.logger.info(`Searching for revisions on item ${itemId}`)

    return this.revisions.filter(revision => revision.itemUuid == itemId)
  }

  async findOneById(itemId: string, id:string): Promise<Revision | undefined> {
    return this.revisions.filter(revision => revision.itemUuid == itemId && revision.uuid == id).shift()
  }
}
