import 'reflect-metadata'
import { ApiVersion } from '../../Api/ApiVersion'
import { ContentType } from '../ContentType'

import { MFAFilter } from './MFAFilter'

describe('MFAFilter', () => {
  const createFilter = () => new MFAFilter()

  it ('should filter out mfa item so it can be skipped on database save', async () => {
    const result = await createFilter().filter({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      itemHash: {
        uuid: '2-3-4',
        content_type: ContentType.MFA,
      },
    })

    expect(result).toEqual({
      passed: false,
    })
  })

  it ('should leave non mfa item so it can be saved to database', async () => {
    const result = await createFilter().filter({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      itemHash: {
        uuid: '2-3-4',
        content_type: ContentType.Note,
      },
    })

    expect(result).toEqual({
      passed: true,
    })
  })
})
