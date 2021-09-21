import { injectable } from 'inversify'
import * as dayjs from 'dayjs'

import { Revision } from '../Domain/Revision/Revision'
import { ProjectorInterface } from './ProjectorInterface'

@injectable()
export class RevisionProjector implements ProjectorInterface<Revision> {
  async projectSimple(revision: Revision): Promise<Record<string, unknown>> {
    return {
      'uuid': revision.uuid,
      'content_type': revision.contentType,
      'created_at': dayjs.utc(revision.createdAt).toISOString(),
      'updated_at': dayjs.utc(revision.updatedAt).toISOString(),
    }
  }

  async projectFull(revision: Revision): Promise<Record<string, unknown>> {
    return {
      'uuid': revision.uuid,
      'item_uuid': (await revision.item).uuid,
      'content': revision.content,
      'content_type': revision.contentType,
      'items_key_id': revision.itemsKeyId,
      'enc_item_key': revision.encItemKey,
      'auth_hash': revision.authHash,
      'creation_date': dayjs.utc(revision.creationDate).format('YYYY-MM-DD'),
      'created_at': dayjs.utc(revision.createdAt).toISOString(),
      'updated_at': dayjs.utc(revision.updatedAt).toISOString(),
    }
  }

  async projectCustom(_projectionType: string, _revision: Revision, ..._args: any[]): Promise<Record<string, unknown>> {
    throw new Error('not implemented')
  }
}
