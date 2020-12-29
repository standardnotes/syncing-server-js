const TYPES = {
  DBConnection: Symbol.for('DBConnection'),
  Logger: Symbol.for('Logger'),
  Redis: Symbol.for('Redis'),
  // Repositories
  RevisionRepository: Symbol.for('RevisionRepository'),
  UserRepository: Symbol.for('UserRepository'),
  SessionRepository: Symbol.for('SessionRepository'),
  EphemeralSessionRepository: Symbol.for('EphemeralSessionRepository'),
  ItemRepository: Symbol.for('ItemRepository'),
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
  // use cases
  AuthenticateUser: Symbol.for('AuthenticateUser'),
  RefreshSessionToken: Symbol.for('RefreshSessionToken'),
  VerifyMFA: Symbol.for('VerifyMFA'),
  SignIn: Symbol.for('SignIn'),
  ClearLoginAttempts: Symbol.for('ClearLoginAttempts'),
  IncreaseLoginAttempts: Symbol.for('IncreaseLoginAttempts'),
  GetUserKeyParams: Symbol.for('GetUserKeyParams'),
  UpdateUser: Symbol.for('UpdateUser'),
  GetActiveSessionsForUser: Symbol.for('GetActiveSessionsForUser'),
  DeletePreviousSessionsForUser: Symbol.for('DeletePreviousSessionsForUser'),
  // Services
  DeviceDetector: Symbol.for('DeviceDetector'),
  SessionService: Symbol.for('SessionService'),
  ContentDecoder: Symbol.for('ContentDecoder'),
  AuthResponseFactory20161215: Symbol.for('AuthResponseFactory20161215'),
  AuthResponseFactory20190520: Symbol.for('AuthResponseFactory20190520'),
  AuthResponseFactory20200115: Symbol.for('AuthResponseFactory20200115'),
  AuthResponseFactoryResolver: Symbol.for('AuthResponseFactoryResolver'),
  KeyParamsFactory: Symbol.for('KeyParamsFactory'),
}

export default TYPES
