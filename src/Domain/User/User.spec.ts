import * as dayjs from 'dayjs'

import { User } from './User'

describe('User', () => {
  const createUser = () => new User()

  it('should indicate if support sessions', () => {
    const user = createUser()
    user.version = '004'

    expect(user.supportsSessions()).toBeTruthy()
  })

  it('should indicate if does not support sessions', () => {
    const user = createUser()
    user.version = '003'

    expect(user.supportsSessions()).toBeFalsy()
  })

  it('should indicate if is locked', () => {
    const user = createUser()

    user.lockedUntil = dayjs.utc().add(1, 'day').toDate()
    expect(user.isLocked()).toBeTruthy()

    user.lockedUntil = dayjs.utc().subtract(1, 'day').toDate()
    expect(user.isLocked()).toBeFalsy()

    user.lockedUntil = null
    expect(user.isLocked()).toBeFalsy()
  })
})
