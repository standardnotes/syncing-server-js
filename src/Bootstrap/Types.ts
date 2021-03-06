const TYPES = {
  DBConnection: Symbol.for('DBConnection'),
  Logger: Symbol.for('Logger'),
  Redis: Symbol.for('Redis'),
  SNS: Symbol.for('SNS'),
  SQS: Symbol.for('SQS'),
  // Repositories
  RevisionRepository: Symbol.for('RevisionRepository'),
  UserRepository: Symbol.for('UserRepository'),
  SessionRepository: Symbol.for('SessionRepository'),
  EphemeralSessionRepository: Symbol.for('EphemeralSessionRepository'),
  RevokedSessionRepository: Symbol.for('RevokedSessionRepository'),
  ItemRepository: Symbol.for('ItemRepository'),
  LockRepository: Symbol.for('LockRepository'),
  // Middleware
  AuthMiddleware: Symbol.for('AuthMiddleware'),
  AuthMiddlewareWithoutResponse: Symbol.for('AuthMiddlewareWithoutResponse'),
  LockMiddleware: Symbol.for('LockMiddleware'),
  SessionMiddleware: Symbol.for('SessionMiddleware'),
  // Projectors
  RevisionProjector: Symbol.for('RevisionProjector'),
  SessionProjector: Symbol.for('SessionProjector'),
  UserProjector: Symbol.for('UserProjector'),
  // env vars
  JWT_SECRET: Symbol.for('JWT_SECRET'),
  LEGACY_JWT_SECRET: Symbol.for('LEGACY_JWT_SECRET'),
  ACCESS_TOKEN_AGE: Symbol.for('ACCESS_TOKEN_AGE'),
  REFRESH_TOKEN_AGE: Symbol.for('REFRESH_TOKEN_AGE'),
  EPHEMERAL_SESSION_AGE: Symbol.for('EPHEMERAL_SESSION_AGE'),
  MAX_LOGIN_ATTEMPTS: Symbol.for('MAX_LOGIN_ATTEMPTS'),
  FAILED_LOGIN_LOCKOUT: Symbol.for('FAILED_LOGIN_LOCKOUT'),
  PSEUDO_KEY_PARAMS_KEY: Symbol.for('PSEUDO_KEY_PARAMS_KEY'),
  REDIS_URL: Symbol.for('REDIS_URL'),
  DISABLE_USER_REGISTRATION: Symbol.for('DISABLE_USER_REGISTRATION'),
  SNS_TOPIC_ARN: Symbol.for('SNS_TOPIC_ARN'),
  SNS_AWS_REGION: Symbol.for('SNS_AWS_REGION'),
  SQS_QUEUE_URL: Symbol.for('SQS_QUEUE_URL'),
  SQS_AWS_REGION: Symbol.for('SQS_AWS_REGION'),
  USER_SERVER_REGISTRATION_URL: Symbol.for('USER_SERVER_REGISTRATION_URL'),
  USER_SERVER_AUTH_KEY: Symbol.for('USER_SERVER_AUTH_KEY'),
  REDIS_EVENTS_CHANNEL: Symbol.for('REDIS_EVENTS_CHANNEL'),
  AUTH_JWT_SECRET: Symbol.for('AUTH_JWT_SECRET'),
  // use cases
  AuthenticateUser: Symbol.for('AuthenticateUser'),
  RefreshSessionToken: Symbol.for('RefreshSessionToken'),
  VerifyMFA: Symbol.for('VerifyMFA'),
  SignIn: Symbol.for('SignIn'),
  ClearLoginAttempts: Symbol.for('ClearLoginAttempts'),
  IncreaseLoginAttempts: Symbol.for('IncreaseLoginAttempts'),
  GetUserKeyParams: Symbol.for('GetUserKeyParams'),
  UpdateUser: Symbol.for('UpdateUser'),
  Register: Symbol.for('Register'),
  GetActiveSessionsForUser: Symbol.for('GetActiveSessionsForUser'),
  DeletePreviousSessionsForUser: Symbol.for('DeletePreviousSessionsForUser'),
  DeleteSessionForUser: Symbol.for('DeleteSessionForUser'),
  ChangePassword: Symbol.for('ChangePassword'),
  // Handlers
  UserRegisteredEventHandler: Symbol.for('UserRegisteredEventHandler'),
  // Services
  DeviceDetector: Symbol.for('DeviceDetector'),
  SessionService: Symbol.for('SessionService'),
  ContentDecoder: Symbol.for('ContentDecoder'),
  AuthResponseFactory20161215: Symbol.for('AuthResponseFactory20161215'),
  AuthResponseFactory20190520: Symbol.for('AuthResponseFactory20190520'),
  AuthResponseFactory20200115: Symbol.for('AuthResponseFactory20200115'),
  AuthResponseFactoryResolver: Symbol.for('AuthResponseFactoryResolver'),
  KeyParamsFactory: Symbol.for('KeyParamsFactory'),
  TokenDecoder: Symbol.for('TokenDecoder'),
  AuthenticationMethodResolver: Symbol.for('AuthenticationMethodResolver'),
  DomainEventPublisher: Symbol.for('DomainEventPublisher'),
  DomainEventSubscriberFactory: Symbol.for('DomainEventSubscriberFactory'),
  DomainEventFactory: Symbol.for('DomainEventFactory'),
  DomainEventMessageHandler: Symbol.for('DomainEventMessageHandler'),
  HTTPClient: Symbol.for('HTTPClient'),
  ItemService: Symbol.for('ItemService')
}

export default TYPES
