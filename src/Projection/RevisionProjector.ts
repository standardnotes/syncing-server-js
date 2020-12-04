import { injectable } from 'inversify'
import * as moment from 'moment'

import { Revision } from '../Domain/Revision/Revision'
import { ProjectorInterface } from './ProjectorInterface'

@injectable()
export class RevisionProjector implements ProjectorInterface<Revision> {
  projectSimple(revision: Revision): Record<string, unknown> {
    return {
      'uuid': revision.uuid,
      'content_type': revision.contentType,
      'created_at': moment.utc(revision.createdAt).toISOString(),
      'updated_at': moment.utc(revision.updatedAt).toISOString()
    }
  }

  projectFull(revision: Revision): Record<string, unknown> {
    return {
      'uuid': revision.uuid,
      'item_uuid': revision.itemUuid,
      'content': revision.content,
      'content_type': revision.contentType,
      'items_key_id': revision.itemsKeyId,
      'enc_item_key': revision.encItemKey,
      'auth_hash': revision.authHash,
      'creation_date': moment.utc(revision.creationDate).format('YYYY-MM-DD'),
      'created_at': moment.utc(revision.createdAt).toISOString(),
      'updated_at': moment.utc(revision.updatedAt).toISOString()
    }
  }

  projectCustom(_projectionType: string, _revision: Revision, ..._args: any[]): Record<string, unknown> {
    throw new Error('not implemented')
  }
}
