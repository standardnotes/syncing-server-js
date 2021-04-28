import 'reflect-metadata'

import * as express from 'express'

import { results } from 'inversify-express-utils'
import { MuteNotifications } from '../Domain/UseCase/MuteNotifications/MuteNotifications'
import { ExtensionSettingsController } from './ExtensionSettingsController'

describe('ExtensionSettingsController', () => {
  let muteNotifications: MuteNotifications
  let request: express.Request

  const createController = () => new ExtensionSettingsController(muteNotifications)

  beforeEach(() => {
    muteNotifications = {} as jest.Mocked<MuteNotifications>
    muteNotifications.execute = jest.fn()

    request = {
      params: {},
    } as jest.Mocked<express.Request>
  })

  it('should mute notifications', async () => {
    request.params.uuid = '1-2-3'

    muteNotifications.execute = jest.fn().mockReturnValue({ success: true, message: 'foo-bar' })

    const httpResponse = <results.JsonResult> await createController().sync(request)
    const result = await httpResponse.executeAsync()

    expect(muteNotifications.execute).toHaveBeenCalledWith({ uuid: '1-2-3' })

    expect(result.statusCode).toEqual(200)
    expect(await result.content.readAsStringAsync()).toEqual('"foo-bar"')
  })

  it('should indicate if muting notifications did not succeed', async () => {
    request.params.uuid = '1-2-3'

    muteNotifications.execute = jest.fn().mockReturnValue({ success: false, message: 'foo-bar' })

    const httpResponse = <results.JsonResult> await createController().sync(request)
    const result = await httpResponse.executeAsync()

    expect(muteNotifications.execute).toHaveBeenCalledWith({ uuid: '1-2-3' })

    expect(result.statusCode).toEqual(400)
    expect(await result.content.readAsStringAsync()).toEqual('"foo-bar"')
  })
})
