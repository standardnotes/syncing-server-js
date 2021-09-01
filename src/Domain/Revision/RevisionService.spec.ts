import { ContentType } from '@standardnotes/common'

import { Item } from '../Item/Item'
import { ItemRevisionRepositoryInterface } from './ItemRevisionRepositoryInterface'
import { Revision } from './Revision'
import { RevisionRepositoryInterface } from './RevisionRepositoryInterface'
import { RevisionService } from './RevisionService'

describe('RevisionService', () => {
  let revisionRepository: RevisionRepositoryInterface
  let itemRevisionRepository: ItemRevisionRepositoryInterface
  let item: Item

  const createService = () => new RevisionService(revisionRepository, itemRevisionRepository)

  beforeEach(() => {
    revisionRepository = {} as jest.Mocked<RevisionRepositoryInterface>
    revisionRepository.save = jest.fn().mockImplementation((revision: Revision) => {
      revision.uuid = '3-4-5'

      return revision
    })
    revisionRepository.removeByItem = jest.fn()

    itemRevisionRepository = {} as jest.Mocked<ItemRevisionRepositoryInterface>
    itemRevisionRepository.save = jest.fn()
    itemRevisionRepository.removeByItem = jest.fn()

    item = {
      authHash: 'test-hash',
      content: 'test-content',
      contentType: ContentType.Note,
      encItemKey: 'test-enc-item-key',
      uuid: '1-2-3',
      itemsKeyId: 'test-items-key-id',
    } as jest.Mocked<Item>
  })

  it('should save a revision for a note item', async () => {
    await createService().createRevision(item)

    expect(revisionRepository.save).toHaveBeenCalledWith({
      uuid: '3-4-5',
      authHash: 'test-hash',
      content: 'test-content',
      contentType: 'Note',
      encItemKey: 'test-enc-item-key',
      itemUuid: '1-2-3',
      itemsKeyId: 'test-items-key-id',
      createdAt: expect.any(Date),
      creationDate: expect.any(Date),
      updatedAt: expect.any(Date),
    })

    expect(itemRevisionRepository.save).toHaveBeenCalledWith({
      itemUuid: '1-2-3',
      revisionUuid: '3-4-5',
    })
  })

  it('should not save a revision for a non note item', async () => {
    item.contentType = ContentType.ItemsKey
    await createService().createRevision(item)

    expect(revisionRepository.save).not.toHaveBeenCalled()
  })

  it('should copy revisions from one item unto another', async() => {
    const itemRevision = {
      itemUuid: '1-2-3',
      revisionUuid: '3-4-5',
    }
    itemRevisionRepository.findByItem = jest.fn().mockReturnValue([ itemRevision ])

    await createService().copyRevisions('1-2-3', '2-3-4')

    expect(itemRevisionRepository.save).toHaveBeenCalledWith({
      itemUuid: '2-3-4',
      revisionUuid: '3-4-5',
    })
  })

  it('should delete all revisions and item_revisions for a given item', async () => {
    await createService().deleteRevisionsForItem(item)

    expect(revisionRepository.removeByItem).toHaveBeenCalledWith('1-2-3')
    expect(itemRevisionRepository.removeByItem).toHaveBeenCalledWith('1-2-3')
  })
})
