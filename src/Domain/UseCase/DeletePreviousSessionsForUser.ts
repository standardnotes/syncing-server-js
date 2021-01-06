import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { Session } from '../Session/Session'
import { SessionRepositoryInterface } from '../Session/SessionRepositoryInterface'
import { SessionServiceInterace } from '../Session/SessionServiceInterface'
import { DeletePreviousSessionsForUserDTO } from './DeletePreviousSessionsForUserDTO'
import { DeletePreviousSessionsForUserResponse } from './DeletePreviousSessionsForUserResponse'
import { UseCaseInterface } from './UseCaseInterface'

@injectable()
export class DeletePreviousSessionsForUser implements UseCaseInterface {
  constructor (
    @inject(TYPES.SessionRepository) private sessionRepository: SessionRepositoryInterface,
    @inject(TYPES.SessionService) private sessionService: SessionServiceInterace
  ) {
  }

  async execute(dto: DeletePreviousSessionsForUserDTO): Promise<DeletePreviousSessionsForUserResponse> {
    const sessions = await this.sessionRepository.findAllByUserUuid(dto.userUuid)

    await Promise.all(sessions.map(async (session: Session) => {
      if (session.uuid !== dto.currentSessionUuid) {
        await this.sessionService.archiveSession(session)
      }
    }))

    await this.sessionRepository.deleteAllByUserUuid(
      dto.userUuid,
      dto.currentSessionUuid
    )

    return { success: true }
  }
}
