import { ContentType } from '@standardnotes/common'
import { FeatureIdentifier } from '@standardnotes/features'
import { TimerInterface } from '@standardnotes/time'
import { AuthHttpServiceInterface } from '../Auth/AuthHttpServiceInterface'

import { Item } from '../Item/Item'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { Revision } from './Revision'
import { RevisionRepositoryInterface } from './RevisionRepositoryInterface'
import { RevisionService } from './RevisionService'

describe('RevisionService', () => {
  let revisionRepository: RevisionRepositoryInterface
  let itemRepository: ItemRepositoryInterface
  let item: Item
  let timer: TimerInterface
  let authHttpService: AuthHttpServiceInterface
  let revision1: Revision
  let revision2: Revision
  let revisionsLimitEnabled: boolean

  const createService = () => new RevisionService(
    revisionRepository,
    itemRepository,
    authHttpService,
    revisionsLimitEnabled,
    timer
  )

  beforeEach(() => {
    revisionsLimitEnabled = true

    revisionRepository = {} as jest.Mocked<RevisionRepositoryInterface>
    revisionRepository.save = jest.fn().mockImplementation((revision: Revision) => {
      revision.uuid = '3-4-5'

      return revision
    })

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findByUuid = jest.fn().mockReturnValue({} as jest.Mocked<Item>)

    revision1 = {
      uuid: '1-2-3',
      item: Promise.resolve({
        uuid: '1-2-3',
      }),
      content: 'content1',
    } as jest.Mocked<Revision>

    revision2 = {
      uuid: '2-3-4',
      item: Promise.resolve({
        uuid: '1-2-3',
      }),
      content: 'content2',
    } as jest.Mocked<Revision>

    revisionRepository.findByItemId = jest.fn().mockReturnValue([ revision1, revision2 ])

    authHttpService = {} as jest.Mocked<AuthHttpServiceInterface>
    authHttpService.getUserFeatures = jest.fn().mockReturnValue([
      {
        identifier: FeatureIdentifier.PlusEditor,
      },
    ])

    timer = {} as jest.Mocked<TimerInterface>
    timer.getUTCDateNDaysAgo = jest.fn().mockImplementation((n: number) => new Date(n))

    item = {
      authHash: 'test-hash',
      content: 'test-content',
      contentType: ContentType.Note,
      encItemKey: 'test-enc-item-key',
      uuid: '1-2-3',
      itemsKeyId: 'test-items-key-id',
    } as jest.Mocked<Item>
  })

  it('should get revisions for an item - limitation disabled', async () => {
    revisionsLimitEnabled = false

    await createService().getRevisions('1-2-3', '2-3-4')

    expect(revisionRepository.findByItemId).toHaveBeenCalledWith({
      itemUuid: '2-3-4',
    })
  })

  it('should get revisions for an item - default days limitation', async () => {
    await createService().getRevisions('1-2-3', '2-3-4')

    expect(revisionRepository.findByItemId).toHaveBeenCalledWith({
      itemUuid: '2-3-4',
      afterDate: new Date(3),
    })
  })

  it('should get revisions for an item - 30 days limitation', async () => {
    authHttpService.getUserFeatures = jest.fn().mockReturnValue([
      {
        identifier: FeatureIdentifier.NoteHistory30Days,
      },
    ])

    await createService().getRevisions('1-2-3', '2-3-4')

    expect(revisionRepository.findByItemId).toHaveBeenCalledWith({
      itemUuid: '2-3-4',
      afterDate: new Date(30),
    })
  })

  it('should get revisions for an item - 365 days limitation', async () => {
    authHttpService.getUserFeatures = jest.fn().mockReturnValue([
      {
        identifier: FeatureIdentifier.NoteHistory365Days,
      },
    ])

    await createService().getRevisions('1-2-3', '2-3-4')

    expect(revisionRepository.findByItemId).toHaveBeenCalledWith({
      itemUuid: '2-3-4',
      afterDate: new Date(365),
    })
  })

  it('should get revisions for an item - unlimited', async () => {
    authHttpService.getUserFeatures = jest.fn().mockReturnValue([
      {
        identifier: FeatureIdentifier.NoteHistoryUnlimited,
      },
    ])

    await createService().getRevisions('1-2-3', '2-3-4')

    expect(revisionRepository.findByItemId).toHaveBeenCalledWith({
      itemUuid: '2-3-4',
    })
  })

  it('should save a revision for a note item', async () => {
    await createService().createRevision(item)

    expect(revisionRepository.save).toHaveBeenCalledWith({
      uuid: '3-4-5',
      authHash: 'test-hash',
      content: 'test-content',
      contentType: 'Note',
      encItemKey: 'test-enc-item-key',
      item: Promise.resolve(item),
      itemsKeyId: 'test-items-key-id',
      createdAt: expect.any(Date),
      creationDate: expect.any(Date),
      updatedAt: expect.any(Date),
    })
  })

  it('should not save a revision for a non note item', async () => {
    item.contentType = ContentType.ItemsKey
    await createService().createRevision(item)

    expect(revisionRepository.save).not.toHaveBeenCalled()
  })

  it('should copy revisions from one item unto another', async() => {
    revisionRepository.save = jest.fn().mockImplementation(revision => revision)

    await createService().copyRevisions('1-2-3', '2-3-4')

    expect(revisionRepository.findByItemId).toHaveBeenCalledWith({ itemUuid: '1-2-3' })

    expect(revisionRepository.save).toHaveBeenNthCalledWith(1, {
      item: Promise.resolve(expect.any(Item)),
      content: 'content1',
      uuid: undefined,
    })
    expect(revisionRepository.save).toHaveBeenNthCalledWith(2, {
      item: Promise.resolve(expect.any(Item)),
      content: 'content2',
      uuid: undefined,
    })
  })

  it('should throw while copying revisions from one item unto another if the target item does not exist', async() => {
    itemRepository.findByUuid = jest.fn().mockReturnValue(undefined)

    let error = null
    try {
      await createService().copyRevisions('1-2-3', '2-3-4')
    } catch (caughtError) {
      error = caughtError
    }

    expect(error).not.toBeNull()
  })
})
