import { RoleName } from '@standardnotes/auth'
import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'
import TYPES from '../Bootstrap/Types'

import { Revision } from '../Domain/Revision/Revision'
import { ProjectorInterface } from './ProjectorInterface'

@injectable()
export class RevisionProjector implements ProjectorInterface<Revision> {
  constructor(
    @inject(TYPES.Timer) private timer: TimerInterface,
  ) {
  }

  async projectSimple(revision: Revision): Promise<Record<string, unknown>> {
    return {
      'uuid': revision.uuid,
      'content_type': revision.contentType,
      'required_role': this.calculateRequiredRoleBasedOnRevisionDate(revision.createdAt),
      'created_at': this.timer.convertDateToISOString(revision.createdAt),
      'updated_at': this.timer.convertDateToISOString(revision.updatedAt),
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
      'creation_date': this.timer.formatDate(revision.creationDate, 'YYYY-MM-DD'),
      'required_role': this.calculateRequiredRoleBasedOnRevisionDate(revision.createdAt),
      'created_at': this.timer.convertDateToISOString(revision.createdAt),
      'updated_at': this.timer.convertDateToISOString(revision.updatedAt),
    }
  }

  async projectCustom(_projectionType: string, _revision: Revision, ..._args: any[]): Promise<Record<string, unknown>> {
    throw new Error('not implemented')
  }

  private calculateRequiredRoleBasedOnRevisionDate(createdAt: Date): RoleName {
    const revisionCreatedNDaysAgo = this.timer.dateWasNDaysAgo(createdAt)

    if (revisionCreatedNDaysAgo > 3 && revisionCreatedNDaysAgo < 30) {
      return RoleName.CoreUser
    }

    if (revisionCreatedNDaysAgo > 30 && revisionCreatedNDaysAgo < 365) {
      return RoleName.PlusUser
    }

    if (revisionCreatedNDaysAgo > 365) {
      return RoleName.ProUser
    }

    return RoleName.BasicUser
  }
}
