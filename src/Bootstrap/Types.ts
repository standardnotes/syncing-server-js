const TYPES = {
  DBConnection: Symbol.for('DBConnection'),
  Logger: Symbol.for('Logger'),
  // Repositories
  RevisionRepository: Symbol.for('RevisionRepository'),
  UserRepository: Symbol.for('UserRepository'),
  SessionRepository: Symbol.for('SessionRepository'),
  ItemRepository: Symbol.for('ItemRepository'),
  // Middleware
  AuthMiddleware: Symbol.for('AuthMiddleware'),
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
  // use cases
  AuthenticateUser: Symbol.for('AuthenticateUser'),
  RefreshSessionToken: Symbol.for('RefreshSessionToken'),
  VerifyMFA: Symbol.for('VerifyMFA'),
  SignIn: Symbol.for('SignIn'),
  // Services
  DeviceDetector: Symbol.for('DeviceDetector'),
  SessionService: Symbol.for('SessionService'),
  ContentDecoder: Symbol.for('ContentDecoder'),
  AuthResponseFactory: Symbol.for('AuthResponseFactory'),
  KeyParamsFactory: Symbol.for('KeyParamsFactory'),
}

export default TYPES
