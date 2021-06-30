import 'reflect-metadata'
import { ItemGetRuleInterface } from '../GetRule/ItemGetRuleInterface'

import { ItemGetValidator } from './ItemGetValidator'
import { Item } from '../Item'

describe('ItemGetValidator', () => {
  let rule: ItemGetRuleInterface
  let item: Item

  const createProcessor = () => new ItemGetValidator([ rule ])

  beforeEach(() => {
    rule = {} as jest.Mocked<ItemGetRuleInterface>
    rule.check = jest.fn().mockReturnValue({ passed: true })

    item = {} as jest.Mocked<Item>
  })

  it('should run item through all filters with passing', async () => {
    const result = await createProcessor().validate({ item })

    expect(result).toEqual({
      passed: true,
    })
  })

  it('should run item through all filters with not passing', async () => {
    rule.check = jest.fn().mockReturnValue({ passed: false })

    const result = await createProcessor().validate({ item })

    expect(result).toEqual({
      passed: false,
    })
  })
})
