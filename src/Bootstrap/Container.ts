import * as winston from 'winston'
import { Container, interfaces } from 'inversify'
import { InMemoryRevisionRepository } from '../Infra/InMemory/InMemoryRevisionRepository'
import { Env } from './Env'
import TYPES from './Types'
import { AuthMiddleware } from '../Controller/AuthMiddleware'
import { AuthenticateUser } from '../Domain/UseCase/AuthenticateUser'
import { InMemorySessionRepository } from '../Infra/InMemory/InMemorySessionRepository'
import { InMemoryUserRepository } from '../Infra/InMemory/InMemoryUserRepository'

export class ContainerConfigLoader {
    public static Load(): Container {
        const env: Env = new Env()
        env.load()

        const container = new Container()
        container.bind<InMemoryRevisionRepository>(TYPES.RevisionRepository).to(InMemoryRevisionRepository)

        container.bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware)

        container.bind<interfaces.Factory<winston.Logger>>(TYPES.LoggerFactory).toFactory<winston.Logger>((_context: interfaces.Context) => {
          return () => {
            const logLevel = env.get('LOG_LEVEL') || 'info'

            return  winston.createLogger({
              level: logLevel,
              format: winston.format.combine(
                  winston.format.splat(),
                  winston.format.json(),
              ),
              transports: [
                  new winston.transports.Console({ level: logLevel }),
              ],
            })
          }
        })

        container.bind<AuthenticateUser>(TYPES.AuthenticateUser).to(AuthenticateUser)

        container.bind<InMemorySessionRepository>(TYPES.SessionRepository).to(InMemorySessionRepository)
        container.bind<InMemoryUserRepository>(TYPES.UserRepository).to(InMemoryUserRepository)

        container.bind(TYPES.JWT_SECRET).toConstantValue(env.get('JWT_SECRET'))
        container.bind(TYPES.LEGACY_JWT_SECRET).toConstantValue(env.get('LEGACY_JWT_SECRET'))

        return container
    }
}
