import 'reflect-metadata'

import { DomainEventFactory } from './DomainEventFactory'

describe('DomainEventFactory', () => {
  const createFactory = () => new DomainEventFactory()

  it('should create a USER_REGISTERED event', () => {
    expect(createFactory().createUserRegisteredEvent('1-2-3', 'test@test.te'))
      .toEqual({
        createdAt: expect.any(Date),
        payload: {
          userUuid: '1-2-3',
          email: 'test@test.te',
        },
        type: 'USER_REGISTERED',
      })
  })

  it('should create a ITEMS_SYNCED event', () => {
    expect(createFactory().createItemsSyncedEvent('1-2-3', 'https://test.com', '2-3-4', ['3-4-5'], false))
      .toEqual({
        createdAt: expect.any(Date),
        payload: {
          userUuid: '1-2-3',
          extensionUrl: 'https://test.com',
          extensionId: '2-3-4',
          itemUuids: [ '3-4-5' ],
          forceMute: false,
        },
        type: 'ITEMS_SYNCED',
      })
  })
})
