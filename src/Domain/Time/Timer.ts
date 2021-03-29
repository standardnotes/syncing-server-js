import * as dayjs from 'dayjs'
import { injectable } from 'inversify'
import { Time } from './Time'
import { TimerInterface } from './TimerInterface'

@injectable()
export class Timer implements TimerInterface {
  getTimestampInMicroseconds(): number {
    const hrTime = process.hrtime()
    return dayjs.utc().valueOf() * Time.MicrosecondsInAMillisecond + Math.floor(hrTime[1] / Time.MicrosecondsInAMillisecond)
  }
}
