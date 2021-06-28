import 'reflect-metadata'
import { ApiVersion } from '../../Api/ApiVersion'
import { ItemHash } from '../ItemHash'
import { ItemSaveFilterInterface } from '../SaveFilter/ItemSaveFilterInterface'

import { ItemSaveProcessor } from './ItemSaveProcessor'

describe('ItemSaveProcessor', () => {
  let filter: ItemSaveFilterInterface
  let itemHash: ItemHash

  const createProcessor = () => new ItemSaveProcessor([ filter ])

  beforeEach(() => {
    filter = {} as jest.Mocked<ItemSaveFilterInterface>
    filter.filter = jest.fn().mockReturnValue({ passed: true })

    itemHash = {} as jest.Mocked<ItemHash>
  })

  it('should run item through all filters with passing', async () => {
    const result = await createProcessor().process({
      apiVersion: ApiVersion.v20200115,
      userUuid: '1-2-3',
      itemHash,
    })

    expect(result).toEqual({
      passed: true,
    })
  })

  it('should run item through all filters with not passing', async () => {
    filter.filter = jest.fn().mockReturnValue({ passed: false })

    const result = await createProcessor().process({
      apiVersion: ApiVersion.v20200115,
      userUuid: '1-2-3',
      itemHash,
    })

    expect(result).toEqual({
      passed: false,
    })
  })
})
