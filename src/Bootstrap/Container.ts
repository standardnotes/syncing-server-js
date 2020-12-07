import * as winston from 'winston'
import { Container } from 'inversify'
import { Env } from './Env'
import TYPES from './Types'
import { AuthMiddleware } from '../Controller/AuthMiddleware'
import { AuthenticateUser } from '../Domain/UseCase/AuthenticateUser'
import { Connection, createConnection, LoggerOptions } from 'typeorm'
import { User } from '../Domain/User/User'
import { Session } from '../Domain/Session/Session'
import { SessionService } from '../Domain/Session/SessionService'
import { MySQLSessionRepository } from '../Infra/MySQL/MySQLSessionRepository'
import { MySQLUserRepository } from '../Infra/MySQL/MySQLUserRepository'
import { MySQLRevisionRepository } from '../Infra/MySQL/MySQLRevisionRepository'
import { Item } from '../Domain/Item/Item'
import { Revision } from '../Domain/Revision/Revision'
import { RevisionProjector } from '../Projection/RevisionProjector'
import DeviceDetector = require('device-detector-js')
import { SessionProjector } from '../Projection/SessionProjector'
import { SessionMiddleware } from '../Controller/SessionMiddleware'

export class ContainerConfigLoader {
    async load(): Promise<Container> {
        const env: Env = new Env()
        env.load()

        const container = new Container()

        const connection: Connection = await createConnection({
          type: 'mysql',
          replication: {
            master: {
              host: env.get('DB_HOST'),
              port: parseInt(env.get('DB_PORT')),
              username: env.get('DB_USERNAME'),
              password: env.get('DB_PASSWORD'),
              database: env.get('DB_DATABASE'),
            },
            slaves: [
              {
                host: env.get('DB_REPLICA_HOST'),
                port: parseInt(env.get('DB_PORT')),
                username: env.get('DB_USERNAME'),
                password: env.get('DB_PASSWORD'),
                database: env.get('DB_DATABASE'),
              }
            ]
          },
          entities: [
            User,
            Session,
            Item,
            Revision
          ],
          migrations: [
            env.get('DB_MIGRATIONS_PATH')
          ],
          migrationsRun: true,
          logging: <LoggerOptions> env.get('DB_DEBUG_LEVEL'),
        })

        container.bind<Connection>(TYPES.DBConnection).toConstantValue(connection)

        container.bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware)
        container.bind<SessionMiddleware>(TYPES.SessionMiddleware).to(SessionMiddleware)

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

        container.bind<MySQLSessionRepository>(TYPES.SessionRepository).toConstantValue(connection.getCustomRepository(MySQLSessionRepository))
        container.bind<MySQLUserRepository>(TYPES.UserRepository).toConstantValue(connection.getCustomRepository(MySQLUserRepository))
        container.bind<MySQLRevisionRepository>(TYPES.RevisionRepository).toConstantValue(connection.getCustomRepository(MySQLRevisionRepository))

        container.bind<SessionService>(TYPES.SessionService).to(SessionService)

        container.bind(TYPES.JWT_SECRET).toConstantValue(env.get('JWT_SECRET'))
        container.bind(TYPES.LEGACY_JWT_SECRET).toConstantValue(env.get('LEGACY_JWT_SECRET'))

        container.bind<RevisionProjector>(TYPES.RevisionProjector).to(RevisionProjector)
        container.bind<SessionProjector>(TYPES.SessionProjector).to(SessionProjector)

        container.bind<DeviceDetector>(TYPES.DeviceDetector).toConstantValue(new DeviceDetector())

        return container
    }
}
