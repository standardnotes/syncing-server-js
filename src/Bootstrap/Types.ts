const TYPES = {
  DBConnection: Symbol.for('DBConnection'),
  Logger: Symbol.for('Logger'),
  Redis: Symbol.for('Redis'),
  SNS: Symbol.for('SNS'),
  SQS: Symbol.for('SQS'),
  S3: Symbol.for('S3'),
  // Repositories
  RevisionRepository: Symbol.for('RevisionRepository'),
  ItemRevisionRepository: Symbol.for('ItemRevisionRepository'),
  UserRepository: Symbol.for('UserRepository'),
  SessionRepository: Symbol.for('SessionRepository'),
  EphemeralSessionRepository: Symbol.for('EphemeralSessionRepository'),
  RevokedSessionRepository: Symbol.for('RevokedSessionRepository'),
  ItemRepository: Symbol.for('ItemRepository'),
  LockRepository: Symbol.for('LockRepository'),
  ExtensionSettingRepository: Symbol.for('ExtensionSettingRepository'),
  // Middleware
  AuthMiddleware: Symbol.for('AuthMiddleware'),
  // Projectors
  RevisionProjector: Symbol.for('RevisionProjector'),
  SessionProjector: Symbol.for('SessionProjector'),
  UserProjector: Symbol.for('UserProjector'),
  ItemProjector: Symbol.for('ItemProjector'),
  ItemConflictProjector: Symbol.for('ItemConflictProjector'),
  // env vars
  JWT_SECRET: Symbol.for('JWT_SECRET'),
  LEGACY_JWT_SECRET: Symbol.for('LEGACY_JWT_SECRET'),
  ACCESS_TOKEN_AGE: Symbol.for('ACCESS_TOKEN_AGE'),
  REFRESH_TOKEN_AGE: Symbol.for('REFRESH_TOKEN_AGE'),
  EPHEMERAL_SESSION_AGE: Symbol.for('EPHEMERAL_SESSION_AGE'),
  MAX_LOGIN_ATTEMPTS: Symbol.for('MAX_LOGIN_ATTEMPTS'),
  FAILED_LOGIN_LOCKOUT: Symbol.for('FAILED_LOGIN_LOCKOUT'),
  REDIS_URL: Symbol.for('REDIS_URL'),
  SNS_TOPIC_ARN: Symbol.for('SNS_TOPIC_ARN'),
  SNS_AWS_REGION: Symbol.for('SNS_AWS_REGION'),
  SQS_QUEUE_URL: Symbol.for('SQS_QUEUE_URL'),
  SQS_AWS_REGION: Symbol.for('SQS_AWS_REGION'),
  USER_SERVER_REGISTRATION_URL: Symbol.for('USER_SERVER_REGISTRATION_URL'),
  USER_SERVER_AUTH_KEY: Symbol.for('USER_SERVER_AUTH_KEY'),
  REDIS_EVENTS_CHANNEL: Symbol.for('REDIS_EVENTS_CHANNEL'),
  AUTH_JWT_SECRET: Symbol.for('AUTH_JWT_SECRET'),
  INTERNAL_DNS_REROUTE_ENABLED: Symbol.for('INTERNAL_DNS_REROUTE_ENABLED'),
  EXTENSIONS_SERVER_URL: Symbol.for('EXTENSIONS_SERVER_URL'),
  AUTH_SERVER_URL: Symbol.for('AUTH_SERVER_URL'),
  S3_AWS_REGION: Symbol.for('S3_AWS_REGION'),
  S3_BACKUP_BUCKET_NAME: Symbol.for('S3_BACKUP_BUCKET_NAME'),
  EMAIL_ATTACHMENT_MAX_BYTE_SIZE: Symbol.for('EMAIL_ATTACHMENT_MAX_BYTE_SIZE'),
  REVISIONS_FREQUENCY: Symbol.for('REVISIONS_FREQUENCY'),
  NEW_RELIC_ENABLED: Symbol.for('NEW_RELIC_ENABLED'),
  // use cases
  AuthenticateUser: Symbol.for('AuthenticateUser'),
  SyncItems: Symbol.for('SyncItems'),
  PostToRealtimeExtensions: Symbol.for('PostToRealtimeExtensions'),
  PostToDailyExtensions: Symbol.for('PostToDailyExtensions'),
  MuteNotifications: Symbol.for('MuteNotifications'),
  // Handlers
  AccountDeletionRequestedEventHandler: Symbol.for('AccountDeletionRequestedEventHandler'),
  DuplicateItemSyncedEventHandler: Symbol.for('DuplicateItemSyncedEventHandler'),
  ItemsSyncedEventHandler: Symbol.for('ItemsSyncedEventHandler'),
  EmailArchiveExtensionSyncedEventHandler: Symbol.for('EmailArchiveExtensionSyncedEventHandler'),
  // Services
  DeviceDetector: Symbol.for('DeviceDetector'),
  SessionService: Symbol.for('SessionService'),
  ContentDecoder: Symbol.for('ContentDecoder'),
  TokenDecoder: Symbol.for('TokenDecoder'),
  AuthenticationMethodResolver: Symbol.for('AuthenticationMethodResolver'),
  DomainEventPublisher: Symbol.for('DomainEventPublisher'),
  DomainEventSubscriberFactory: Symbol.for('DomainEventSubscriberFactory'),
  DomainEventFactory: Symbol.for('DomainEventFactory'),
  DomainEventMessageHandler: Symbol.for('DomainEventMessageHandler'),
  HTTPClient: Symbol.for('HTTPClient'),
  ItemService: Symbol.for('ItemService'),
  Timer: Symbol.for('Timer'),
  SyncResponseFactory20161215: Symbol.for('SyncResponseFactory20161215'),
  SyncResponseFactory20200115: Symbol.for('SyncResponseFactory20200115'),
  SyncResponseFactoryResolver: Symbol.for('SyncResponseFactoryResolver'),
  AuthHttpService: Symbol.for('AuthHttpService'),
  ExtensionsHttpService: Symbol.for('ExtensionsHttpService'),
  ItemBackupService: Symbol.for('ItemBackupService'),
  RevisionService: Symbol.for('RevisionService'),
}

export default TYPES
