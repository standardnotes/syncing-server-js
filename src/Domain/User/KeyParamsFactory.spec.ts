import 'reflect-metadata'

import { KeyParamsFactory } from './KeyParamsFactory'
import { User } from './User'

describe('KeyParamsFactory', () => {
  let user: User

  const createFactory = () => new KeyParamsFactory()

  beforeEach(() => {
    user = new User()
    user.version = 'test'
    user.email = 'test@test.te'
    user.kpCreated = 'kpCreated'
    user.kpOrigination = 'kpOrigination'
    user.pwNonce = 'pwNonce'
    user.pwCost = 1
    user.pwSalt = 'qwe'
    user.pwAlg = 'pwAlg'
    user.pwFunc = 'pwFunc'
    user.pwKeySize = 2
  })

  it('should create a basic key params structure', () => {
    expect(createFactory().create(user)).toEqual({
      identifier: 'test@test.te',
      version: 'test'
    })
  })

  it('should create a key params structure for 001 version', () => {
    user.version = '001'

    expect(createFactory().create(user)).toEqual({
      email: 'test@test.te',
      identifier: 'test@test.te',
      pw_alg: 'pwAlg',
      pw_cost: 1,
      pw_func: 'pwFunc',
      pw_key_size: 2,
      pw_salt: 'qwe',
      version: '001',
    })
  })

  it('should create a key params structure for 002 version', () => {
    user.version = '002'

    expect(createFactory().create(user)).toEqual({
      email: 'test@test.te',
      identifier: 'test@test.te',
      pw_cost: 1,
      pw_salt: 'qwe',
      version: '002',
    })
  })

  it('should create a key params structure for 003 version', () => {
    user.version = '003'

    expect(createFactory().create(user)).toEqual({
      identifier: 'test@test.te',
      pw_cost: 1,
      pw_nonce: 'pwNonce',
      version: '003',
    })
  })

  it('should create a key params structure for 004 version', () => {
    user.version = '004'

    expect(createFactory().create(user)).toEqual({
      identifier: 'test@test.te',
      created: 'kpCreated',
      origination: 'kpOrigination',
      pw_nonce: 'pwNonce',
      version: '004',
    })
  })
})
