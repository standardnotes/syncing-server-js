import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../../Bootstrap/Types'
import { ApiVersion } from '../../Api/ApiVersion'
import { SyncResponseFactory20161215 } from './SyncResponseFactory20161215'
import { SyncResponseFactory20200115 } from './SyncResponseFactory20200115'
import { SyncResponseFactoryInterface } from './SyncResponseFactoryInterface'
import { SyncResponseFactoryResolverInterface } from './SyncResponseFactoryResolverInterface'

@injectable()
export class SyncResponseFactoryResolver implements SyncResponseFactoryResolverInterface {
  constructor(
    @inject(TYPES.SyncResponseFactory20161215) private syncResponseFactory20161215: SyncResponseFactory20161215,
    @inject(TYPES.SyncResponseFactory20200115) private syncResponseFactory20200115: SyncResponseFactory20200115,
    @inject(TYPES.Logger) private logger: Logger
  ) {
  }

  resolveSyncResponseFactoryVersion(apiVersion?: string): SyncResponseFactoryInterface {
    this.logger.debug(`Resolving sync response factory for api version: ${apiVersion}`)

    switch(apiVersion) {
    case ApiVersion.v20190520:
    case ApiVersion.v20200115:
      return this.syncResponseFactory20200115
    default:
      return this.syncResponseFactory20161215
    }
  }
}
