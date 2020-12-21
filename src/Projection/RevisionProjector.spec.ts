import * as dayjs from 'dayjs'

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
    revision.creationDate = dayjs.utc('2020-11-26').toDate()
    revision.createdAt = dayjs.utc('2020-11-26 13:34').toDate()
    revision.updatedAt = dayjs.utc('2020-11-26 13:34').toDate()
  })

  it('should create a simple projection of a revision', () => {
    const projection = createProjector().projectSimple(revision)
    expect(projection).toMatchObject({
      content_type: 'Note',
      created_at: '2020-11-26T13:34:00.000Z',
      updated_at: '2020-11-26T13:34:00.000Z',
      uuid: '123'
    })
  })

  it('should create a full projection of a revision', () => {
    const projection = createProjector().projectFull(revision)
    expect(projection).toMatchObject({
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

  it('should throw error on not implemetned custom projection', () => {
    let error = null
    try {
      createProjector().projectCustom('test', revision)
    } catch (e) {
      error = e
    }
    expect(error.message).toEqual('not implemented')
  })
})
