import { Revision } from '../Domain/Revision/Revision'
import { RevisionProjector } from './RevisionProjector'

describe('RevisionProjector', () => {
  let revision: Revision

  const createProjector = () => new RevisionProjector()

  beforeEach(() => {
    revision = new Revision()
    revision.content = 'test'
    revision.contentType = 'Note'
    revision.uuid = '123',
    revision.itemsKeyId = '123',
    revision.creationDate = new Date('2020-11-26')
    revision.createdAt = new Date('2020-11-26 14:34')
    revision.updatedAt = new Date('2020-11-26 14:34')
  })

  it('should create a simple projection of a revision', () => {
    const projection = createProjector().projectSimple(revision)
    expect(projection).toEqual({
      content_type: 'Note',
      created_at: '2020-11-26T13:34:00.000Z',
      updated_at: '2020-11-26T13:34:00.000Z',
      uuid: '123'
    })
  })

  it('should create a full projection of a revision', () => {
    const projection = createProjector().projectFull(revision)
    expect(projection).toEqual({
      auth_hash: undefined,
      content: 'test',
      content_type: 'Note',
      created_at: '2020-11-26T13:34:00.000Z',
      creation_date: '2020-11-26',
      enc_item_key: undefined,
      item_uuid: undefined,
      items_key_id: '123',
      updated_at: '2020-11-26T13:34:00.000Z',
      uuid: '123'
    })
  })
})
