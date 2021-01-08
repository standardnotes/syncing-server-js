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
})
