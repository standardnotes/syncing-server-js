
import { inject, injectable } from 'inversify'
import { ContentType } from '@standardnotes/common'
import { FeatureIdentifier } from '@standardnotes/features'

import TYPES from '../../Bootstrap/Types'
import { Item } from '../Item/Item'
import { Revision } from './Revision'
import { RevisionRepositoryInterface } from './RevisionRepositoryInterface'
import { RevisionServiceInterface } from './RevisionServiceInterface'
import { AuthHttpServiceInterface } from '../Auth/AuthHttpServiceInterface'
import { TimerInterface } from '@standardnotes/time'

@injectable()
export class RevisionService implements RevisionServiceInterface {
  constructor (
    @inject(TYPES.RevisionRepository) private revisionRepository: RevisionRepositoryInterface,
    @inject(TYPES.AuthHttpService) private authHttpService: AuthHttpServiceInterface,
    @inject(TYPES.REVISIONS_LIMIT_ENABLED) private revisionsLimitEnabled: boolean,
    @inject(TYPES.Timer) private timer: TimerInterface,
  ) {
  }

  async getRevisions(userUuid: string, itemUuid: string): Promise<Revision[]> {
    let afterDate = undefined
    if (this.revisionsLimitEnabled) {
      const revisionDaysLimit = await this.getRevisionDaysLimit(userUuid)
      afterDate = revisionDaysLimit ? this.timer.getUTCDateNDaysAgo(revisionDaysLimit) : undefined
    }

    const revisions = await this.revisionRepository.findByItemId({
      itemUuid,
      afterDate,
    })

    return revisions
  }

  async copyRevisions(fromItemUuid: string, toItemUuid: string): Promise<void> {
    const revisions = await this.revisionRepository.findByItemId({
      itemUuid: fromItemUuid,
    })

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

  private async getRevisionDaysLimit(userUuid: string): Promise<number | undefined> {
    const userFeatures = await this.authHttpService.getUserFeatures(userUuid)

    for (const userFeature of userFeatures) {
      if (userFeature.identifier === FeatureIdentifier.NoteHistory30Days) {
        return 30
      }

      if (userFeature.identifier === FeatureIdentifier.NoteHistory365Days) {
        return 365
      }

      if (userFeature.identifier === FeatureIdentifier.NoteHistoryUnlimited) {
        return undefined
      }
    }

    return 3
  }
}
