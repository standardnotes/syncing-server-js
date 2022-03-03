import 'reflect-metadata'

import { ItemRepositoryInterface } from '../../Item/ItemRepositoryInterface'

import { CheckIntegrity } from './CheckIntegrity'

describe('CheckIntegrity', () => {
  let itemRepository: ItemRepositoryInterface

  const createUseCase = () => new CheckIntegrity(itemRepository)

  beforeEach(() => {
    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findItemsForComputingIntegrityPayloads = jest.fn().mockReturnValue([
      {
        uuid: '1-2-3',
        updated_at_timestamp: 1,
      },
      {
        uuid: '2-3-4',
        updated_at_timestamp: 2,
      },
      {
        uuid: '3-4-5',
        updated_at_timestamp: 3,
      },
    ])
  })

  it('should return an empty result if there are no integrity mismatches', async () => {
    expect(await createUseCase().execute({
      userUuid: '1-2-3',
      integrityPayloads: [
        {
          uuid: '1-2-3',
          updated_at_timestamp: 1,
        },
        {
          uuid: '2-3-4',
          updated_at_timestamp: 2,
        },
        {
          uuid: '3-4-5',
          updated_at_timestamp: 3,
        },
      ],
    })).toEqual({
      mismatches: [],
    })
  })

  it('should return a mismatch item that has a different update at timemstap', async () => {
    expect(await createUseCase().execute({
      userUuid: '1-2-3',
      integrityPayloads: [
        {
          uuid: '1-2-3',
          updated_at_timestamp: 1,
        },
        {
          uuid: '2-3-4',
          updated_at_timestamp: 1,
        },
        {
          uuid: '3-4-5',
          updated_at_timestamp: 3,
        },
      ],
    })).toEqual({
      mismatches: [
        {
          uuid: '2-3-4',
          updated_at_timestamp: 2,
        },
      ],
    })
  })

  it('should return a mismatch item that is missing on the client side', async () => {
    expect(await createUseCase().execute({
      userUuid: '1-2-3',
      integrityPayloads: [
        {
          uuid: '1-2-3',
          updated_at_timestamp: 1,
        },
        {
          uuid: '2-3-4',
          updated_at_timestamp: 2,
        },
      ],
    })).toEqual({
      mismatches: [
        {
          uuid: '3-4-5',
          updated_at_timestamp: 3,
        },
      ],
    })
  })
})
