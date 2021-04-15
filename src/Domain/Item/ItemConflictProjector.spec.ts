import 'reflect-metadata'

import { ProjectorInterface } from '../../Projection/ProjectorInterface'
import { Item } from './Item'
import { ItemConflict } from './ItemConflict'
import { ItemConflictProjector } from './ItemConflictProjector'
import { ItemHash } from './ItemHash'
import { ItemProjection } from './ItemProjection'

describe('ItemConflictProjector', () => {
  let itemProjector: ProjectorInterface<Item>
  let itemProjection: ItemProjection
  let itemConflict1: ItemConflict
  let itemConflict2: ItemConflict
  let item: Item
  let itemHash: ItemHash

  const createProjector = () => new ItemConflictProjector(itemProjector)

  beforeEach(() => {
    itemProjection = {} as jest.Mocked<ItemProjection>

    itemProjector = {} as jest.Mocked<ProjectorInterface<Item>>
    itemProjector.projectFull = jest.fn().mockReturnValue(itemProjection)

    item = {} as jest.Mocked<Item>

    itemHash = {} as jest.Mocked<ItemHash>

    itemConflict1 = {
      serverItem: item,
      type: 'sync_conflict',
    }

    itemConflict2 = {
      unsavedItem: itemHash,
      type: 'uuid_conflict',
    }
  })

  it('should create a full projection of a server item conflict', () => {
    expect(createProjector().projectFull(itemConflict1)).toMatchObject({
      server_item: itemProjection,
      type: 'sync_conflict',
    })
  })

  it('should create a full projection of an unsaved item conflict', () => {
    expect(createProjector().projectFull(itemConflict2)).toMatchObject({
      unsaved_item: itemHash,
      type: 'uuid_conflict',
    })
  })

  it('should throw error on custom projection', () => {
    let error = null
    try {
      createProjector().projectCustom('test', itemConflict1)
    } catch (e) {
      error = e
    }
    expect(error.message).toEqual('not implemented')
  })

  it('should throw error on simple projection', () => {
    let error = null
    try {
      createProjector().projectSimple(itemConflict1)
    } catch (e) {
      error = e
    }
    expect(error.message).toEqual('not implemented')
  })
})
