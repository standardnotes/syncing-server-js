import 'reflect-metadata'

import * as dayjs from 'dayjs'
import { Time, TimerInterface } from '@standardnotes/time'
import { ContentType } from '@standardnotes/common'

import { ItemFactory } from './ItemFactory'
import { ItemHash } from './ItemHash'

describe('ItemFactory', () => {
  let timer: TimerInterface

  const createFactory = () => new ItemFactory(timer)

  beforeEach(() => {
    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(1616164633241568)
    timer.convertMicrosecondsToDate = jest.fn().mockImplementation((microseconds: number) => {
      return dayjs.utc(Math.floor(microseconds / Time.MicrosecondsInAMillisecond)).toDate()
    })
    timer.convertStringDateToMicroseconds = jest.fn()
      .mockImplementation((date: string) => dayjs.utc(date).valueOf() * 1000)
    timer.convertStringDateToDate = jest.fn().mockImplementation((date: string) => dayjs.utc(date).toDate())
  })

  it ('should create an item based on item hash', () => {
    const itemHash = {
      uuid: '1-2-3',
    } as jest.Mocked<ItemHash>

    const item = createFactory().create('a-b-c', itemHash)

    expect(item).toEqual({
      createdAtTimestamp: 1616164633241568,
      createdAt: expect.any(Date),
      lastUserAgent: null,
      updatedAt: expect.any(Date),
      updatedAtTimestamp: 1616164633241568,
      userUuid: 'a-b-c',
      uuid: '1-2-3',
      contentSize: 0,
    })
  })

  it ('should create a stub item based on item hash with update_at date and timestamps overwritten', () => {
    const itemHash = {
      uuid: '1-2-3',
      updated_at: '2021-03-25T09:37:37.943Z',
    } as jest.Mocked<ItemHash>

    const item = createFactory().createStub('a-b-c', itemHash)

    expect(item).toEqual({
      createdAtTimestamp: 1616164633241568,
      createdAt: expect.any(Date),
      lastUserAgent: null,
      updatedAt: new Date('2021-03-25T09:37:37.943Z'),
      updatedAtTimestamp: 1616665057943000,
      userUuid: 'a-b-c',
      uuid: '1-2-3',
      content: null,
      contentSize: 0,
    })
  })

  it ('should create a stub item based on item hash with update_at_timestamp date and timestamps overwritten', () => {
    const itemHash = {
      uuid: '1-2-3',
      updated_at_timestamp: 1616164633241568,
      content: 'foobar',
    } as jest.Mocked<ItemHash>

    const item = createFactory().createStub('a-b-c', itemHash)

    expect(item).toEqual({
      createdAtTimestamp: 1616164633241568,
      createdAt: expect.any(Date),
      lastUserAgent: null,
      updatedAt: new Date('2021-03-19T14:37:13.241Z'),
      updatedAtTimestamp: 1616164633241568,
      userUuid: 'a-b-c',
      uuid: '1-2-3',
      content: 'foobar',
      contentSize: 6,
    })
  })

  it ('should create a stub item based on item hash without updated timestamps', () => {
    const itemHash = {
      uuid: '1-2-3',
    } as jest.Mocked<ItemHash>

    const item = createFactory().createStub('a-b-c', itemHash)

    expect(item).toEqual({
      createdAtTimestamp: 1616164633241568,
      createdAt: expect.any(Date),
      lastUserAgent: null,
      updatedAt: expect.any(Date),
      updatedAtTimestamp: 1616164633241568,
      userUuid: 'a-b-c',
      uuid: '1-2-3',
      content: null,
      contentSize: 0,
    })
  })

  it ('should create an item based on item hash with all fields filled', () => {
    const itemHash = {
      uuid: '1-2-3',
      content: 'asdqwe1',
      content_type: ContentType.Note,
      duplicate_of: '222',
      auth_hash: 'aaa',
      deleted: true,
      enc_item_key: 'qweqwe1',
      items_key_id: 'asdasd1',
      created_at: dayjs.utc(1616164633241).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      updated_at: dayjs.utc(1616164633242).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
    } as jest.Mocked<ItemHash>

    const item = createFactory().create('a-b-c', itemHash)

    expect(item).toEqual({
      content: 'asdqwe1',
      contentSize: 7,
      contentType: 'Note',
      createdAt: expect.any(Date),
      createdAtTimestamp: 1616164633241000,
      encItemKey: 'qweqwe1',
      itemsKeyId: 'asdasd1',
      authHash: 'aaa',
      deleted: true,
      duplicateOf: '222',
      lastUserAgent: null,
      updatedAt: expect.any(Date),
      updatedAtTimestamp: 1616164633241568,
      userUuid: 'a-b-c',
      uuid: '1-2-3',
    })
  })

  it ('should create an item based on item hash with created at timestamp', () => {
    const itemHash = {
      uuid: '1-2-3',
      content: 'asdqwe1',
      content_type: ContentType.Note,
      duplicate_of: null,
      enc_item_key: 'qweqwe1',
      items_key_id: 'asdasd1',
      created_at_timestamp: 1616164633241312,
      updated_at: dayjs.utc(1616164633242).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
    } as jest.Mocked<ItemHash>

    const item = createFactory().create('a-b-c', itemHash, 'Mozilla Firefox')

    expect(item).toEqual({
      content: 'asdqwe1',
      contentSize: 7,
      contentType: 'Note',
      createdAt: expect.any(Date),
      createdAtTimestamp: 1616164633241312,
      encItemKey: 'qweqwe1',
      itemsKeyId: 'asdasd1',
      updatedAt: expect.any(Date),
      lastUserAgent: 'Mozilla Firefox',
      updatedAtTimestamp: 1616164633241568,
      userUuid: 'a-b-c',
      uuid: '1-2-3',
    })
  })
})
