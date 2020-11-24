import { injectable } from 'inversify'

import { Session } from '../../Domain/Session/Session'
import { SessionRepositoryInterface } from '../../Domain/Session/SessionRepositoryInterface'

@injectable()
export class InMemorySessionRepository implements SessionRepositoryInterface {
  async findOneByToken(_token: string): Promise<Session | undefined> {
    return undefined
  }
}
