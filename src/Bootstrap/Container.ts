import * as winston from 'winston'
import { Container, interfaces } from 'inversify'
import { InMemoryRevisionRepository } from '../Infra/InMemory/InMemoryRevisionRepository'
import { Env } from './Env'
import TYPES from './Types'
import { AuthMiddleware } from '../Controller/AuthMiddleware'
import { AuthenticateUser } from '../Domain/UseCase/AuthenticateUser'
import { InMemorySessionRepository } from '../Infra/InMemory/InMemorySessionRepository'
import { InMemoryUserRepository } from '../Infra/InMemory/InMemoryUserRepository'
import { Connection, createConnection } from 'typeorm'
import { User } from '../Domain/User/User'
import { Session } from '../Domain/Session/Session'

export class ContainerConfigLoader {
    async load(): Promise<Container> {
        const env: Env = new Env()
        env.load()

        const container = new Container()

        const connection: Connection = await createConnection({
          type: 'mysql',
          host: env.get('DB_HOST'),
          port: parseInt(env.get('DB_PORT')),
          username: env.get('DB_USERNAME'),
          password: env.get('DB_PASSWORD'),
          database: env.get('DB_DATABASE'),
          entities: [
            User,
            Session
          ],
          synchronize: true,
        })

        container.bind<Connection>(TYPES.DBConnection).toConstantValue(connection)

        container.bind<InMemoryRevisionRepository>(TYPES.RevisionRepository).to(InMemoryRevisionRepository)

        container.bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware)

        const logger = winston.createLogger({
          level: env.get('LOG_LEVEL') || 'info',
          format: winston.format.combine(
              winston.format.splat(),
              winston.format.json(),
          ),
          transports: [
              new winston.transports.Console({ level: env.get('LOG_LEVEL') || 'info' }),
          ],
        })

        container.bind<winston.Logger>(TYPES.Logger).toConstantValue(logger)

        container.bind<AuthenticateUser>(TYPES.AuthenticateUser).to(AuthenticateUser)

        container.bind<InMemorySessionRepository>(TYPES.SessionRepository).to(InMemorySessionRepository)
        container.bind<InMemoryUserRepository>(TYPES.UserRepository).to(InMemoryUserRepository)

        container.bind(TYPES.JWT_SECRET).toConstantValue(env.get('JWT_SECRET'))
        container.bind(TYPES.LEGACY_JWT_SECRET).toConstantValue(env.get('LEGACY_JWT_SECRET'))

        return container
    }
}
