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

    const jsonRevision = JSON.stringify(revision)
    expect(jsonRevision).not.toContain('"contentType"')
    expect(jsonRevision).not.toContain('"content"')
    expect(jsonRevision).toContain('"content_type"')
  })
})
