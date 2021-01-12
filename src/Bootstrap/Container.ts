import * as winston from 'winston'
import * as IORedis from 'ioredis'
import * as AWS from 'aws-sdk'
import * as superagent from 'superagent'
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
import { AuthMiddlewareWithoutResponse } from '../Controller/AuthMiddlewareWithoutResponse'
import { GetUserKeyParams } from '../Domain/UseCase/GetUserKeyParams'
import { UpdateUser } from '../Domain/UseCase/UpdateUser'
import { RedisEphemeralSessionRepository } from '../Infra/Redis/RedisEphemeralSessionRepository'
import { GetActiveSessionsForUser } from '../Domain/UseCase/GetActiveSessionsForUser'
import { DeletePreviousSessionsForUser } from '../Domain/UseCase/DeletePreviousSessionsForUser'
import { DeleteSessionForUser } from '../Domain/UseCase/DeleteSessionForUser'
import { Register } from '../Domain/UseCase/Register'
import { LockRepository } from '../Infra/Redis/LockRepository'
import { MySQLRevokedSessionRepository } from '../Infra/MySQL/MySQLRevokedSessionRepository'
import { TokenDecoder } from '../Domain/Auth/TokenDecoder'
import { AuthenticationMethodResolver } from '../Domain/Auth/AuthenticationMethodResolver'
import { RevokedSession } from '../Domain/Session/RevokedSession'
import { SNSDomainEventPublisher } from '../Infra/SNS/SNSDomainEventPublisher'
import { DomainEventFactory } from '../Domain/Event/DomainEventFactory'
import { RedisDomainEventPublisher } from '../Infra/Redis/RedisDomainEventPublisher'
import { EventMessageHandlerInterface } from '../Domain/Event/EventMessageHandlerInterface'
import { SQSEventMessageHandler } from '../Infra/SQS/SQSEventMessageHandler'
import { DomainEventSubscriberFactoryInterface } from '../Domain/Event/DomainEventSubscriberFactoryInterface'
import { SQSDomainEventSubscriberFactory } from '../Infra/SQS/SQSDomainEventSubscriberFactory'
import { RedisEventMessageHandler } from '../Infra/Redis/RedisEventMessageHandler'
import { RedisDomainEventSubscriberFactory } from '../Infra/Redis/RedisDomainEventSubscriberFactory'
import { DomainEventHandlerInterface } from '../Domain/Handler/DomainEventHandlerInterface'
import { UserRegisteredEventHandler } from '../Domain/Handler/UserRegisteredEventHandler'

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
            RevokedSession,
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

        const redisUrl = env.get('REDIS_URL')
        const isRedisInClusterMode = redisUrl.indexOf(',') > 0
        let redis
        if (isRedisInClusterMode) {
          redis = new IORedis.Cluster(redisUrl.split(','))
        } else {
          redis = new IORedis(redisUrl)
        }

        container.bind(TYPES.Redis).toConstantValue(redis)

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

        if (env.get('SNS_AWS_REGION', true)) {
          container.bind<AWS.SNS>(TYPES.SNS).toConstantValue(new AWS.SNS({
            apiVersion: 'latest',
            region: env.get('SNS_AWS_REGION', true)
          }))
        }

        if (env.get('SQS_AWS_REGION', true)) {
          container.bind<AWS.SQS>(TYPES.SQS).toConstantValue(new AWS.SQS({
            apiVersion: 'latest',
            region: env.get('SQS_AWS_REGION', true)
          }))
        }

        // Repositories
        container.bind<MySQLSessionRepository>(TYPES.SessionRepository).toConstantValue(connection.getCustomRepository(MySQLSessionRepository))
        container.bind<MySQLRevokedSessionRepository>(TYPES.RevokedSessionRepository).toConstantValue(connection.getCustomRepository(MySQLRevokedSessionRepository))
        container.bind<MySQLUserRepository>(TYPES.UserRepository).toConstantValue(connection.getCustomRepository(MySQLUserRepository))
        container.bind<MySQLRevisionRepository>(TYPES.RevisionRepository).toConstantValue(connection.getCustomRepository(MySQLRevisionRepository))
        container.bind<MySQLItemRepository>(TYPES.ItemRepository).toConstantValue(connection.getCustomRepository(MySQLItemRepository))
        container.bind<RedisEphemeralSessionRepository>(TYPES.EphemeralSessionRepository).to(RedisEphemeralSessionRepository)
        container.bind<LockRepository>(TYPES.LockRepository).to(LockRepository)

        // Middleware
        container.bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware)
        container.bind<SessionMiddleware>(TYPES.SessionMiddleware).to(SessionMiddleware)
        container.bind<LockMiddleware>(TYPES.LockMiddleware).to(LockMiddleware)
        container.bind<AuthMiddlewareWithoutResponse>(TYPES.AuthMiddlewareWithoutResponse).to(AuthMiddlewareWithoutResponse)

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
        container.bind(TYPES.PSEUDO_KEY_PARAMS_KEY).toConstantValue(env.get('PSEUDO_KEY_PARAMS_KEY'))
        container.bind(TYPES.EPHEMERAL_SESSION_AGE).toConstantValue(env.get('EPHEMERAL_SESSION_AGE'))
        container.bind(TYPES.REDIS_URL).toConstantValue(env.get('REDIS_URL'))
        container.bind(TYPES.DISABLE_USER_REGISTRATION).toConstantValue(env.get('DISABLE_USER_REGISTRATION') === 'true')
        container.bind(TYPES.SNS_TOPIC_ARN).toConstantValue(env.get('SNS_TOPIC_ARN', true))
        container.bind(TYPES.SNS_AWS_REGION).toConstantValue(env.get('SNS_AWS_REGION', true))
        container.bind(TYPES.SQS_QUEUE_URL).toConstantValue(env.get('SQS_QUEUE_URL', true))
        container.bind(TYPES.USER_SERVER_REGISTRATION_URL).toConstantValue(env.get('USER_SERVER_REGISTRATION_URL', true))
        container.bind(TYPES.USER_SERVER_AUTH_KEY).toConstantValue(env.get('USER_SERVER_AUTH_KEY', true))

        // use cases
        container.bind<AuthenticateUser>(TYPES.AuthenticateUser).to(AuthenticateUser)
        container.bind<RefreshSessionToken>(TYPES.RefreshSessionToken).to(RefreshSessionToken)
        container.bind<SignIn>(TYPES.SignIn).to(SignIn)
        container.bind<VerifyMFA>(TYPES.VerifyMFA).to(VerifyMFA)
        container.bind<ClearLoginAttempts>(TYPES.ClearLoginAttempts).to(ClearLoginAttempts)
        container.bind<IncreaseLoginAttempts>(TYPES.IncreaseLoginAttempts).to(IncreaseLoginAttempts)
        container.bind<GetUserKeyParams>(TYPES.GetUserKeyParams).to(GetUserKeyParams)
        container.bind<UpdateUser>(TYPES.UpdateUser).to(UpdateUser)
        container.bind<Register>(TYPES.Register).to(Register)
        container.bind<GetActiveSessionsForUser>(TYPES.GetActiveSessionsForUser).to(GetActiveSessionsForUser)
        container.bind<DeletePreviousSessionsForUser>(TYPES.DeletePreviousSessionsForUser).to(DeletePreviousSessionsForUser)
        container.bind<DeleteSessionForUser>(TYPES.DeleteSessionForUser).to(DeleteSessionForUser)

        // Handlers
        container.bind<UserRegisteredEventHandler>(TYPES.UserRegisteredEventHandler).to(UserRegisteredEventHandler)

        // Services
        container.bind<DeviceDetector>(TYPES.DeviceDetector).toConstantValue(new DeviceDetector())
        container.bind<SessionService>(TYPES.SessionService).to(SessionService)
        container.bind<ContentDecoder>(TYPES.ContentDecoder).to(ContentDecoder)
        container.bind<AuthResponseFactory20161215>(TYPES.AuthResponseFactory20161215).to(AuthResponseFactory20161215)
        container.bind<AuthResponseFactory20190520>(TYPES.AuthResponseFactory20190520).to(AuthResponseFactory20190520)
        container.bind<AuthResponseFactory20200115>(TYPES.AuthResponseFactory20200115).to(AuthResponseFactory20200115)
        container.bind<AuthResponseFactoryResolver>(TYPES.AuthResponseFactoryResolver).to(AuthResponseFactoryResolver)
        container.bind<KeyParamsFactory>(TYPES.KeyParamsFactory).to(KeyParamsFactory)
        container.bind<TokenDecoder>(TYPES.TokenDecoder).to(TokenDecoder)
        container.bind<AuthenticationMethodResolver>(TYPES.AuthenticationMethodResolver).to(AuthenticationMethodResolver)
        container.bind<DomainEventFactory>(TYPES.DomainEventFactory).to(DomainEventFactory)
        container.bind<superagent.SuperAgentStatic>(TYPES.HTTPClient).toConstantValue(superagent)

        if (env.get('SNS_TOPIC_ARN', true)) {
          container.bind<SNSDomainEventPublisher>(TYPES.DomainEventPublisher).to(SNSDomainEventPublisher)
        } else {
          container.bind<RedisDomainEventPublisher>(TYPES.DomainEventPublisher).to(RedisDomainEventPublisher)
        }

        const eventHandlers: Map<string, DomainEventHandlerInterface> = new Map([
          ['USER_REGISTERED', container.get(TYPES.UserRegisteredEventHandler)]
        ])

        if (env.get('SQS_QUEUE_URL', true)) {
          container.bind<EventMessageHandlerInterface>(TYPES.EventMessageHandler).toConstantValue(
            new SQSEventMessageHandler(eventHandlers, container.get(TYPES.Logger))
          )
          container.bind<DomainEventSubscriberFactoryInterface>(TYPES.DomainEventSubscriberFactory).to(SQSDomainEventSubscriberFactory)
        } else {
          container.bind<EventMessageHandlerInterface>(TYPES.EventMessageHandler).toConstantValue(
            new RedisEventMessageHandler(eventHandlers, container.get(TYPES.Logger))
          )
          container.bind<DomainEventSubscriberFactoryInterface>(TYPES.DomainEventSubscriberFactory).to(RedisDomainEventSubscriberFactory)
        }

        return container
    }
}
