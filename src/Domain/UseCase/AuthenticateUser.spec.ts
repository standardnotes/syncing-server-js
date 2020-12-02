import 'reflect-metadata'
import { Session } from '../Session/Session'

import { SessionServiceInterace } from '../Session/SessionServiceInterface'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { AuthenticateUser } from './AuthenticateUser'

describe('AuthenticateUser', () => {
  let userRepository: UserRepositoryInterface
  let sessionService: SessionServiceInterace
  let user: User
  let session: Session

  const createUseCase = () => new AuthenticateUser('secret', 'legacy_secret', userRepository, sessionService)

  beforeEach(() => {
    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUuid = jest.fn()

    sessionService = {} as jest.Mocked<SessionServiceInterace>
    sessionService.getSessionFromToken = jest.fn()

    user = {} as jest.Mocked<User>
    user.supportsSessions = jest.fn().mockReturnValue(false)
    session = {} as jest.Mocked<Session>
    session.accessExpired = jest.fn().mockReturnValue(false)
    session.refreshExpired = jest.fn().mockReturnValue(false)
  })

  it('should authenticate a user based on a JWT token', async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcl91dWlkIjoiMTIzIiwicHdfaGFzaCI6IjlmODZkMDgxODg0YzdkNjU5YTJmZWFhMGM1NWFkMDE1YTNiZjRmMWIyYjBiODIyY2QxNWQ2YzE1YjBmMDBhMDgiLCJpYXQiOjE1MTYyMzkwMjJ9.TXDPCbCAITDjcUUorHsF4S5Nxkz4eFE4F3TPCsKI89A'

    user.encryptedPassword = 'test'
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)

    const response = await createUseCase().execute({ token })

    expect(response.success).toBeTruthy()
  })

  it('should not authenticate a user if the JWT token is inavlid', async () => {
    const response = await createUseCase().execute({ token: 'test' })

    expect(response.success).toBeFalsy()
  })

  it('should not authenticate a user if the user is from JWT token is not found', async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcl91dWlkIjoiMTIzIiwicHdfaGFzaCI6IjlmODZkMDgxODg0YzdkNjU5YTJmZWFhMGM1NWFkMDE1YTNiZjRmMWIyYjBiODIyY2QxNWQ2YzE1YjBmMDBhMDgiLCJpYXQiOjE1MTYyMzkwMjJ9.TXDPCbCAITDjcUUorHsF4S5Nxkz4eFE4F3TPCsKI89A'

    userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    const response = await createUseCase().execute({ token })

    expect(response.success).toBeFalsy()
  })

  it('should not authenticate a user if the user from JWT token supports sessions', async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcl91dWlkIjoiMTIzIiwicHdfaGFzaCI6IjlmODZkMDgxODg0YzdkNjU5YTJmZWFhMGM1NWFkMDE1YTNiZjRmMWIyYjBiODIyY2QxNWQ2YzE1YjBmMDBhMDgiLCJpYXQiOjE1MTYyMzkwMjJ9.TXDPCbCAITDjcUUorHsF4S5Nxkz4eFE4F3TPCsKI89A'

    user.supportsSessions = jest.fn().mockReturnValue(true)
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)

    const response = await createUseCase().execute({ token })

    expect(response.success).toBeFalsy()
  })

  it('should not authenticate a user if the password hash is incorrect', async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcl91dWlkIjoiMTIzIiwicHdfaGFzaCI6IjlmODZkMDgxODg0YzdkNjU5YTJmZWFhMGM1NWFkMDE1YTNiZjRmMWIyYjBiODIyY2QxNWQ2YzE1YjBmMDBhMDgiLCJpYXQiOjE1MTYyMzkwMjJ9.TXDPCbCAITDjcUUorHsF4S5Nxkz4eFE4F3TPCsKI89A'

    user.encryptedPassword = 'foo'
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)

    const response = await createUseCase().execute({ token })

    expect(response.success).toBeFalsy()
  })

  it('should authenticate a user from a session token', async () => {
    sessionService.getSessionFromToken = jest.fn().mockReturnValue(session)

    user.supportsSessions = jest.fn().mockReturnValue(true)
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)

    const response = await createUseCase().execute({ token: 'test-session-token' })

    expect(response.success).toBeTruthy()
  })

  it('should not authenticate a user from a session token if session is expired', async () => {
    session.accessExpired = jest.fn().mockReturnValue(true)
    sessionService.getSessionFromToken = jest.fn().mockReturnValue(session)

    user.supportsSessions = jest.fn().mockReturnValue(true)
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)

    const response = await createUseCase().execute({ token: 'test-session-token' })

    expect(response.success).toBeFalsy()
  })

  it('should not authenticate a user from a session token if refresh token is expired', async () => {
    session.refreshExpired = jest.fn().mockReturnValue(true)
    sessionService.getSessionFromToken = jest.fn().mockReturnValue(session)

    user.supportsSessions = jest.fn().mockReturnValue(true)
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)

    const response = await createUseCase().execute({ token: 'test-session-token' })

    expect(response.success).toBeFalsy()
  })
})
