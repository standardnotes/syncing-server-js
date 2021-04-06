import { Request } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpGet, results } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { MuteNotifications } from '../Domain/UseCase/MuteNotifications/MuteNotifications'

@controller('/extension-settings')
export class ExtensionSettingsController extends BaseHttpController {
  constructor(
    @inject(TYPES.MuteNotifications) private muteNotifications: MuteNotifications,
  ) {
    super()
  }

  @httpGet('/:uuid/mute')
  public async sync(request: Request): Promise<results.JsonResult> {
    const muteResult = await this.muteNotifications.execute({ uuid: request.params.uuid })

    if (!muteResult.success) {
      return this.json(muteResult.message, 400)
    }

    return this.json(muteResult.message)
  }
}
