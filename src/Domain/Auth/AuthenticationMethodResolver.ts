import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { SessionServiceInterace } from '../Session/SessionServiceInterface'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { AuthenticationMethod } from './AuthenticationMethod'
import { AuthenticationMethodResolverInterface } from './AuthenticationMethodResolverInterface'
import { TokenDecoderInterface } from './TokenDecoderInterface'

@injectable()
export class AuthenticationMethodResolver implements AuthenticationMethodResolverInterface {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.SessionService) private sessionService: SessionServiceInterace,
    @inject(TYPES.TokenDecoder) private tokenDecoder: TokenDecoderInterface
  ) {
  }

  async resolve(token: string): Promise<AuthenticationMethod | undefined> {
    const decodedToken = this.tokenDecoder.decode(token)
    if (decodedToken) {
      return {
        type: 'jwt',
        user: await this.userRepository.findOneByUuid(<string> decodedToken.user_uuid),
        claims: decodedToken,
      }
    }

    const session = await this.sessionService.getSessionFromToken(token)
    if (session) {
      return {
        type: 'session_token',
        user: await this.userRepository.findOneByUuid(session.userUuid),
        session: session,
      }
    }

    const revokedSession = await this.sessionService.getRevokedSessionFromToken(token)
    if (revokedSession) {
      return {
        type: 'revoked',
        revokedSession
      }
    }

    return undefined
  }
}
