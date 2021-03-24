import dayjs = require('dayjs')
import { injectable } from 'inversify'
import { TimerInterface } from './TimerInterface'

@injectable()
export class Timer implements TimerInterface {
  getTimestampInMicroseconds(): number {
    const hrTime = process.hrtime()
    return dayjs.utc().valueOf() * 1000 + Math.floor(hrTime[1] / 1000)
  }
}
