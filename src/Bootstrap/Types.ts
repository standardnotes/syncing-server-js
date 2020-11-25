const TYPES = {
  RevisionRepository: Symbol.for('RevisionRepository'),
  Logger: Symbol.for('Logger'),
  AuthMiddleware: Symbol.for('AuthMiddleware'),
  AuthenticateUser: Symbol.for('AuthenticateUser'),
  JWT_SECRET: Symbol.for('JWT_SECRET'),
  LEGACY_JWT_SECRET: Symbol.for('LEGACY_JWT_SECRET'),
  UserRepository: Symbol.for('UserRepository'),
  SessionRepository: Symbol.for('SessionRepository'),
  DBConnection: Symbol.for('DBConnection'),
  SessionService: Symbol.for('SessionService'),
}

export default TYPES
