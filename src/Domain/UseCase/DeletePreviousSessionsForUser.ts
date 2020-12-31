import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { SessionRepositoryInterface } from '../Session/SessionRepositoryInterface'
import { DeletePreviousSessionsForUserDTO } from './DeletePreviousSessionsForUserDTO'
import { DeletePreviousSessionsForUserResponse } from './DeletePreviousSessionsForUserResponse'
import { UseCaseInterface } from './UseCaseInterface'

@injectable()
export class DeletePreviousSessionsForUser implements UseCaseInterface {
  constructor (
    @inject(TYPES.SessionRepository) private sessionRepository: SessionRepositoryInterface
  ) {
  }

  async execute(dto: DeletePreviousSessionsForUserDTO): Promise<DeletePreviousSessionsForUserResponse> {
    await this.sessionRepository.deleteAllByUserUuid(
      dto.userUuid,
      dto.currentSessionUuid
    )

    return { success: true }
  }
}
