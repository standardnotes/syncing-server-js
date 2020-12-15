import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { AuthResponseFactory20161215 } from './AuthResponseFactory20161215'
import { AuthResponseFactory20190520 } from './AuthResponseFactory20190520'
import { AuthResponseFactory20200115 } from './AuthResponseFactory20200115'
import { AuthResponseFactoryInterface } from './AuthResponseFactoryInterface'
import { AuthResponseFactoryResolverInterface } from './AuthResponseFactoryResolverInterface'

@injectable()
export class AuthResponseFactoryResolver implements AuthResponseFactoryResolverInterface {
  constructor(
    @inject(TYPES.AuthResponseFactory20161215) private authResponseFactory20161215: AuthResponseFactory20161215,
    @inject(TYPES.AuthResponseFactory20190520) private authResponseFactory20190520: AuthResponseFactory20190520,
    @inject(TYPES.AuthResponseFactory20200115) private authResponseFactory20200115: AuthResponseFactory20200115,
  ) {
  }

  resolveAuthResponseFactoryVersion(apiVersion: string): AuthResponseFactoryInterface {
    switch(apiVersion) {
      case '20161215':
        return this.authResponseFactory20161215
      case '20190520':
        return this.authResponseFactory20190520
      case '20200115':
        return this.authResponseFactory20200115
      default:
        throw Error(`Not supported api version: ${apiVersion}`)
    }
  }
}
