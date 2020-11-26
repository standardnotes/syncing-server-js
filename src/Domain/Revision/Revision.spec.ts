import { Revision } from './Revision'

describe('Revision', () => {
  it('should instantiate', () => {
    expect(new Revision()).toBeInstanceOf(Revision)
  })

  it('should serialize to JSON', () => {
    const revision = new Revision()
    revision.content = 'test'
    revision.contentType = 'Note'
    revision.uuid = '123',
    revision.createdAt = new Date('2020-11-26 14:34')
    revision.updatedAt = new Date('2020-11-26 14:34')

    expect(JSON.stringify(revision)).toBe('{"uuid":"123","content_type":"Note","created_at":"2020-11-26T13:34:00.000Z","updated_at":"2020-11-26T13:34:00.000Z"}')
  })
})
