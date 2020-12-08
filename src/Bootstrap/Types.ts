const TYPES = {
  RevisionRepository: Symbol.for('RevisionRepository'),
  Logger: Symbol.for('Logger'),
  AuthMiddleware: Symbol.for('AuthMiddleware'),
  AuthenticateUser: Symbol.for('AuthenticateUser'),
  UserRepository: Symbol.for('UserRepository'),
  SessionRepository: Symbol.for('SessionRepository'),
  DBConnection: Symbol.for('DBConnection'),
  SessionService: Symbol.for('SessionService'),
  RevisionProjector: Symbol.for('RevisionProjector'),
  SessionProjector: Symbol.for('SessionProjector'),
  DeviceDetector: Symbol.for('DeviceDetector'),
  SessionMiddleware: Symbol.for('SessionMiddleware'),
  RefreshSessionToken: Symbol.for('RefreshSessionToken'),
  // env vars
  JWT_SECRET: Symbol.for('JWT_SECRET'),
  LEGACY_JWT_SECRET: Symbol.for('LEGACY_JWT_SECRET'),
  ACCESS_TOKEN_AGE: Symbol.for('ACCESS_TOKEN_AGE'),
  REFRESH_TOKEN_AGE: Symbol.for('REFRESH_TOKEN_AGE'),
}

export default TYPES
