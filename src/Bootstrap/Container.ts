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
import { RefreshSessionToken } from '../Domain/UseCase/RefreshSessionToken'
import { KeyParamsFactory } from '../Domain/User/KeyParamsFactory'
import { MySQLItemRepository } from '../Infra/MySQL/MySQLItemRepository'
import { SignIn } from '../Domain/UseCase/SignIn'
import { VerifyMFA } from '../Domain/UseCase/VerifyMFA'
import { ContentDecoder } from '../Domain/Item/ContentDecoder'
import { UserProjector } from '../Projection/UserProjector'
import { AuthResponseFactory20161215 } from '../Domain/Auth/AuthResponseFactory20161215'
import { AuthResponseFactory20190520 } from '../Domain/Auth/AuthResponseFactory20190520'
import { AuthResponseFactory20200115 } from '../Domain/Auth/AuthResponseFactory20200115'
import { AuthResponseFactoryResolver } from '../Domain/Auth/AuthResponseFactoryResolver'
import { ClearLoginAttempts } from '../Domain/UseCase/ClearLoginAttempts'
import { IncreaseLoginAttempts } from '../Domain/UseCase/IncreaseLoginAttempts'
import { LockMiddleware } from '../Controller/LockMiddleware'

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

        // Repositories
        container.bind<MySQLSessionRepository>(TYPES.SessionRepository).toConstantValue(connection.getCustomRepository(MySQLSessionRepository))
        container.bind<MySQLUserRepository>(TYPES.UserRepository).toConstantValue(connection.getCustomRepository(MySQLUserRepository))
        container.bind<MySQLRevisionRepository>(TYPES.RevisionRepository).toConstantValue(connection.getCustomRepository(MySQLRevisionRepository))
        container.bind<MySQLItemRepository>(TYPES.ItemRepository).toConstantValue(connection.getCustomRepository(MySQLItemRepository))

        // Middleware
        container.bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware)
        container.bind<SessionMiddleware>(TYPES.SessionMiddleware).to(SessionMiddleware)
        container.bind<LockMiddleware>(TYPES.SessionMiddleware).to(LockMiddleware)

        // Projectors
        container.bind<RevisionProjector>(TYPES.RevisionProjector).to(RevisionProjector)
        container.bind<SessionProjector>(TYPES.SessionProjector).to(SessionProjector)
        container.bind<UserProjector>(TYPES.UserProjector).to(UserProjector)

        // env vars
        container.bind(TYPES.JWT_SECRET).toConstantValue(env.get('JWT_SECRET'))
        container.bind(TYPES.LEGACY_JWT_SECRET).toConstantValue(env.get('LEGACY_JWT_SECRET'))
        container.bind(TYPES.ACCESS_TOKEN_AGE).toConstantValue(env.get('ACCESS_TOKEN_AGE'))
        container.bind(TYPES.REFRESH_TOKEN_AGE).toConstantValue(env.get('REFRESH_TOKEN_AGE'))
        container.bind(TYPES.MAX_LOGIN_ATTEMPTS).toConstantValue(env.get('MAX_LOGIN_ATTEMPTS'))
        container.bind(TYPES.FAILED_LOGIN_LOCKOUT).toConstantValue(env.get('FAILED_LOGIN_LOCKOUT'))

        // use cases
        container.bind<AuthenticateUser>(TYPES.AuthenticateUser).to(AuthenticateUser)
        container.bind<RefreshSessionToken>(TYPES.RefreshSessionToken).to(RefreshSessionToken)
        container.bind<SignIn>(TYPES.SignIn).to(SignIn)
        container.bind<VerifyMFA>(TYPES.VerifyMFA).to(VerifyMFA)
        container.bind<ClearLoginAttempts>(TYPES.ClearLoginAttempts).to(ClearLoginAttempts)
        container.bind<IncreaseLoginAttempts>(TYPES.IncreaseLoginAttempts).to(IncreaseLoginAttempts)

        // Services
        container.bind<DeviceDetector>(TYPES.DeviceDetector).toConstantValue(new DeviceDetector())
        container.bind<SessionService>(TYPES.SessionService).to(SessionService)
        container.bind<ContentDecoder>(TYPES.ContentDecoder).to(ContentDecoder)
        container.bind<AuthResponseFactory20161215>(TYPES.AuthResponseFactory20161215).to(AuthResponseFactory20161215)
        container.bind<AuthResponseFactory20190520>(TYPES.AuthResponseFactory20190520).to(AuthResponseFactory20190520)
        container.bind<AuthResponseFactory20200115>(TYPES.AuthResponseFactory20200115).to(AuthResponseFactory20200115)
        container.bind<AuthResponseFactoryResolver>(TYPES.AuthResponseFactoryResolver).to(AuthResponseFactoryResolver)
        container.bind<KeyParamsFactory>(TYPES.KeyParamsFactory).to(KeyParamsFactory)

        return container
    }
}
