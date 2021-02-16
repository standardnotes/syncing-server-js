import { inject, injectable } from 'inversify'
import * as dayjs from 'dayjs'
import TYPES from '../Bootstrap/Types'

import { Session } from '../Domain/Session/Session'
import { SessionServiceInterace } from '../Domain/Session/SessionServiceInterface'
import { ProjectorInterface } from './ProjectorInterface'

@injectable()
export class SessionProjector implements ProjectorInterface<Session> {
  static readonly CURRENT_SESSION_PROJECTION = 'CURRENT_SESSION_PROJECTION'

  constructor(
    @inject(TYPES.SessionService) private sessionService: SessionServiceInterace
  ) {
  }

  projectSimple(session: Session): Record<string, unknown> {
    return {
      uuid: session.uuid,
      api_version: session.apiVersion,
      created_at: dayjs.utc(session.createdAt).toISOString(),
      updated_at: dayjs.utc(session.updatedAt).toISOString(),
      device_info: this.sessionService.getDeviceInfo(session)
    }
  }

  projectCustom(projectionType: string, session: Session, currentSession: Session): Record<string, unknown> {
    switch(projectionType) {
    case SessionProjector.CURRENT_SESSION_PROJECTION.toString():
      return {
        uuid: session.uuid,
        api_version: session.apiVersion,
        created_at: dayjs.utc(session.createdAt).toISOString(),
        updated_at: dayjs.utc(session.updatedAt).toISOString(),
        device_info: this.sessionService.getDeviceInfo(session),
        current: session.uuid === currentSession.uuid
      }
    default:
      throw new Error(`Not supported projection type: ${projectionType}`)
    }
  }

  projectFull(_session: Session): Record<string, unknown> {
    throw Error('not implemented')
  }
}
