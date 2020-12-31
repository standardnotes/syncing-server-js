import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { SessionRepositoryInterface } from '../Session/SessionRepositoryInterface'
import { GetActiveSessionsForUserDTO } from './GetActiveSessionsForUserDTO'
import { GetActiveSessionsForUserResponse } from './GetActiveSessionsForUserResponse'
import { UseCaseInterface } from './UseCaseInterface'

@injectable()
export class GetActiveSessionsForUser implements UseCaseInterface {
  constructor (
    @inject(TYPES.SessionRepository) private sessionRepository: SessionRepositoryInterface,
  ) {
  }

  async execute(dto: GetActiveSessionsForUserDTO): Promise<GetActiveSessionsForUserResponse> {
    return {
      sessions: await this.sessionRepository.findAllByRefreshExpirationAndUserUuid(dto.userUuid)
    }
  }
}
