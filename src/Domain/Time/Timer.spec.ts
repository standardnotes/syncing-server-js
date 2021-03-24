import 'reflect-metadata'

import { Timer } from './Timer'

describe('Timer', () => {
  const createTimer = () => new Timer()

  it('should return a timestamp in microseconds', () => {
    const timestamp = createTimer().getTimestampInMicroseconds()
    expect(`${timestamp}`.length).toEqual(16)
  })
})
