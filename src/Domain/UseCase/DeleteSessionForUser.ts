import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { SessionRepositoryInterface } from '../Session/SessionRepositoryInterface'
import { SessionServiceInterace } from '../Session/SessionServiceInterface'
import { DeleteSessionForUserDTO } from './DeleteSessionForUserDTO'
import { DeleteSessionForUserResponse } from './DeleteSessionForUserResponse'
import { UseCaseInterface } from './UseCaseInterface'

@injectable()
export class DeleteSessionForUser implements UseCaseInterface {
  constructor(
    @inject(TYPES.SessionRepository) private sessionRepository: SessionRepositoryInterface,
    @inject(TYPES.SessionService) private sessionService: SessionServiceInterace
  ) {
  }

  async execute(dto: DeleteSessionForUserDTO): Promise<DeleteSessionForUserResponse> {
    const session = await this.sessionRepository.findOneByUuidAndUserUuid(dto.sessionUuid, dto.userUuid)
    if (!session) {
      return {
        success: false,
        errorMessage: 'No session exists with the provided identifier.'
      }
    }

    await this.sessionService.revokeSession(session)

    await this.sessionRepository.deleteOneByUuid(dto.sessionUuid)

    return { success: true }
  }
}
