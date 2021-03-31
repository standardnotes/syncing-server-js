import 'reflect-metadata'

import { Logger } from 'winston'
import { ApiVersion } from '../../Api/ApiVersion'
import { SyncResponseFactory20161215 } from './SyncResponseFactory20161215'
import { SyncResponseFactory20200115 } from './SyncResponseFactory20200115'
import { SyncResponseFactoryResolver } from './SyncResponseFactoryResolver'

describe('SyncResponseFactoryResolver', () => {
  let syncResponseFactory20161215: SyncResponseFactory20161215
  let syncResponseFactory20200115: SyncResponseFactory20200115
  let logger: Logger

  const createResolver = () => new SyncResponseFactoryResolver(syncResponseFactory20161215, syncResponseFactory20200115, logger)

  beforeEach(() => {
    syncResponseFactory20161215 = {} as jest.Mocked<SyncResponseFactory20161215>

    syncResponseFactory20200115 = {} as jest.Mocked<SyncResponseFactory20200115>

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
  })

  it('should resolve factory for API Version 20161215', () => {
    expect(
      createResolver().resolveSyncResponseFactoryVersion(ApiVersion.v20161215)
    ).toEqual(syncResponseFactory20161215)
  })

  it('should resolve factory for API Version 20200115', () => {
    expect(
      createResolver().resolveSyncResponseFactoryVersion(ApiVersion.v20200115)
    ).toEqual(syncResponseFactory20200115)
  })

  it('should resolve factory for API Version 20190520', () => {
    expect(
      createResolver().resolveSyncResponseFactoryVersion(ApiVersion.v20190520)
    ).toEqual(syncResponseFactory20200115)
  })

  it('should resolve factory for undefined API Version', () => {
    expect(
      createResolver().resolveSyncResponseFactoryVersion()
    ).toEqual(syncResponseFactory20161215)
  })
})
