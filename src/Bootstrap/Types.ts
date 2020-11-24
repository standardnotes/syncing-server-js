const TYPES = {
  RevisionRepository: Symbol.for('RevisionRepository'),
  LoggerFactory: Symbol.for('LoggerFactory'),
  AuthMiddleware: Symbol.for('AuthMiddleware'),
  AuthenticateUser: Symbol.for('AuthenticateUser'),
  JWT_SECRET: Symbol.for('JWT_SECRET'),
  LEGACY_JWT_SECRET: Symbol.for('LEGACY_JWT_SECRET'),
  UserRepository: Symbol.for('UserRepository'),
  SessionRepository: Symbol.for('SessionRepository'),
}

export default TYPES
