import 'reflect-metadata'
import { Session } from '../Session/Session'

import { SessionRepositoryInterface } from '../Session/SessionRepositoryInterface'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { AuthenticateUser } from './AuthenticateUser'

describe('AuthenticateUser', () => {
  let userRepository: UserRepositoryInterface
  let sessionRepository: SessionRepositoryInterface
  let user: User
  let session: Session

  const createUseCase = () => new AuthenticateUser('secret', 'legacy_secret', userRepository, sessionRepository)

  beforeEach(() => {
    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneById = jest.fn()

    sessionRepository = {} as jest.Mocked<SessionRepositoryInterface>
    sessionRepository.findOneByToken = jest.fn()

    user = {} as jest.Mocked<User>
    session = {} as jest.Mocked<Session>
  })

  it('should authenticate a user based on a JWT token', async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcl91dWlkIjoiMTIzIiwicHdfaGFzaCI6IjlmODZkMDgxODg0YzdkNjU5YTJmZWFhMGM1NWFkMDE1YTNiZjRmMWIyYjBiODIyY2QxNWQ2YzE1YjBmMDBhMDgiLCJpYXQiOjE1MTYyMzkwMjJ9.TXDPCbCAITDjcUUorHsF4S5Nxkz4eFE4F3TPCsKI89A'

    user.encryptedPassword = 'test'
    userRepository.findOneById = jest.fn().mockReturnValue(user)

    const response = await createUseCase().execute({ token })

    expect(response.success).toBeTruthy()
  })

  it('should not authenticate a user if the JWT token is inavlid', async () => {
    const response = await createUseCase().execute({ token: 'test' })

    expect(response.success).toBeFalsy()
  })

  it('should not authenticate a user if the user is from JWT token is not found', async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcl91dWlkIjoiMTIzIiwicHdfaGFzaCI6IjlmODZkMDgxODg0YzdkNjU5YTJmZWFhMGM1NWFkMDE1YTNiZjRmMWIyYjBiODIyY2QxNWQ2YzE1YjBmMDBhMDgiLCJpYXQiOjE1MTYyMzkwMjJ9.TXDPCbCAITDjcUUorHsF4S5Nxkz4eFE4F3TPCsKI89A'

    userRepository.findOneById = jest.fn().mockReturnValue(null)

    const response = await createUseCase().execute({ token })

    expect(response.success).toBeFalsy()
  })

  it('should not authenticate a user if the user from JWT token supports sessions', async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcl91dWlkIjoiMTIzIiwicHdfaGFzaCI6IjlmODZkMDgxODg0YzdkNjU5YTJmZWFhMGM1NWFkMDE1YTNiZjRmMWIyYjBiODIyY2QxNWQ2YzE1YjBmMDBhMDgiLCJpYXQiOjE1MTYyMzkwMjJ9.TXDPCbCAITDjcUUorHsF4S5Nxkz4eFE4F3TPCsKI89A'

    user.supportsSessions = true
    userRepository.findOneById = jest.fn().mockReturnValue(user)

    const response = await createUseCase().execute({ token })

    expect(response.success).toBeFalsy()
  })

  it('should not authenticate a user if the password hash is incorrect', async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcl91dWlkIjoiMTIzIiwicHdfaGFzaCI6IjlmODZkMDgxODg0YzdkNjU5YTJmZWFhMGM1NWFkMDE1YTNiZjRmMWIyYjBiODIyY2QxNWQ2YzE1YjBmMDBhMDgiLCJpYXQiOjE1MTYyMzkwMjJ9.TXDPCbCAITDjcUUorHsF4S5Nxkz4eFE4F3TPCsKI89A'

    user.encryptedPassword = 'foo'
    userRepository.findOneById = jest.fn().mockReturnValue(user)

    const response = await createUseCase().execute({ token })

    expect(response.success).toBeFalsy()
  })

  it('should authenticate a user from a session token', async () => {
    sessionRepository.findOneByToken = jest.fn().mockReturnValue(session)

    user.supportsSessions = true
    userRepository.findOneById = jest.fn().mockReturnValue(user)

    const response = await createUseCase().execute({ token: 'test-session-token' })

    expect(response.success).toBeTruthy()
  })

  it('should not authenticate a user from a session token if session is expired', async () => {
    session.accessExpired = true
    sessionRepository.findOneByToken = jest.fn().mockReturnValue(session)

    user.supportsSessions = true
    userRepository.findOneById = jest.fn().mockReturnValue(user)

    const response = await createUseCase().execute({ token: 'test-session-token' })

    expect(response.success).toBeFalsy()
  })

  it('should not authenticate a user from a session token if refresh token is expired', async () => {
    session.refreshExpired = true
    sessionRepository.findOneByToken = jest.fn().mockReturnValue(session)

    user.supportsSessions = true
    userRepository.findOneById = jest.fn().mockReturnValue(user)

    const response = await createUseCase().execute({ token: 'test-session-token' })

    expect(response.success).toBeFalsy()
  })
})
