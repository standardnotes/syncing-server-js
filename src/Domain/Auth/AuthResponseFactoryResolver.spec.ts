import 'reflect-metadata'

import { AuthResponseFactory20161215 } from './AuthResponseFactory20161215'
import { AuthResponseFactory20190520 } from './AuthResponseFactory20190520'
import { AuthResponseFactory20200115 } from './AuthResponseFactory20200115'
import { AuthResponseFactoryResolver } from './AuthResponseFactoryResolver'

describe('AuthResponseFactoryResolver', () => {
  let authResponseFactory20161215: AuthResponseFactory20161215
  let authResponseFactory20190520: AuthResponseFactory20190520
  let authResponseFactory20200115: AuthResponseFactory20200115

  const createResolver = () => new AuthResponseFactoryResolver(
    authResponseFactory20161215,
    authResponseFactory20190520,
    authResponseFactory20200115
  )

  beforeEach(() => {
    authResponseFactory20161215 = {} as jest.Mocked<AuthResponseFactory20161215>
    authResponseFactory20190520 = {} as jest.Mocked<AuthResponseFactory20190520>
    authResponseFactory20200115 = {} as jest.Mocked<AuthResponseFactory20200115>
  })

  it('should resolve 2016 response factory', () => {
    expect(createResolver().resolveAuthResponseFactoryVersion('20161215')).toEqual(authResponseFactory20161215)
  })

  it('should resolve 2019 response factory', () => {
    expect(createResolver().resolveAuthResponseFactoryVersion('20190520')).toEqual(authResponseFactory20190520)
  })

  it('should resolve 2020 response factory', () => {
    expect(createResolver().resolveAuthResponseFactoryVersion('20200115')).toEqual(authResponseFactory20200115)
  })

  it('should throw error on unsupported api version', () => {
    let error = null
    try {
      createResolver().resolveAuthResponseFactoryVersion('20200116')
    } catch (caughtError) {
      error = caughtError
    }

    expect(error.message).toEqual('Not supported api version: 20200116')
  })
})
