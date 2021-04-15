import 'reflect-metadata'

import { Timer } from './Timer'

describe('Timer', () => {
  const createTimer = () => new Timer()

  it('should return a timestamp in microseconds', () => {
    const timestamp = createTimer().getTimestampInMicroseconds()
    expect(`${timestamp}`.length).toEqual(16)
  })

  it('should convert a string date to microseconds', () => {
    const timestamp = createTimer().convertStringDateToMicroseconds('2021-03-29 08:00:05.233Z')
    expect(timestamp).toEqual(1617004805233000)
  })

  it('should convert microseconds to string date', () => {
    expect(createTimer().convertMicrosecondsToStringDate(1617004805233123))
      .toEqual('2021-03-29T08:00:05.233123Z')
  })

  it('should convert a string date to milliseconds', () => {
    const timestamp = createTimer().convertStringDateToMilliseconds('Mon Mar 29 2021 12:13:45 GMT+0200')
    expect(timestamp).toEqual(1617012825000)
  })

  it('should convert microseconds to milliseconds', () => {
    expect(createTimer().convertMicrosecondsToMilliseconds(1616164633241312)).toEqual(1616164633241)
  })

  it('should convert microseconds to seconds', () => {
    expect(createTimer().convertMicrosecondsToSeconds(1616164633241312)).toEqual(1616164633)
  })
})
