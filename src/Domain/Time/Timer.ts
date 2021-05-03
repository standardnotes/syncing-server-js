import * as dayjs from 'dayjs'
import { injectable } from 'inversify'
import { Time } from './Time'
import { TimerInterface } from './TimerInterface'

@injectable()
export class Timer implements TimerInterface {
  convertMicrosecondsToSeconds(microseconds: number): number {
    return Math.floor(microseconds / Time.MicrosecondsInASecond)
  }

  getTimestampInMicroseconds(): number {
    const hrTime = process.hrtime()
    return dayjs.utc().valueOf() * Time.MicrosecondsInAMillisecond + Math.floor(hrTime[1] / Time.MicrosecondsInAMillisecond)
  }

  getUTCDate(): Date {
    return dayjs.utc().toDate()
  }

  convertStringDateToDate(date: string): Date {
    return dayjs.utc(date).toDate()
  }

  convertStringDateToMicroseconds(date: string): number {
    return this.convertStringDateToMilliseconds(date) * Time.MicrosecondsInAMillisecond
  }

  convertStringDateToMilliseconds(date: string): number {
    return dayjs.utc(date).valueOf()
  }

  convertMicrosecondsToMilliseconds(microseconds: number): number {
    return Math.floor(microseconds / Time.MicrosecondsInAMillisecond)
  }

  convertMicrosecondsToStringDate(microseconds: number): string {
    const milliseconds = this.convertMicrosecondsToMilliseconds(microseconds)

    const microsecondsString = microseconds.toString().substring(13)

    return dayjs.utc(milliseconds).format(`YYYY-MM-DDTHH:mm:ss.SSS${microsecondsString}[Z]`)
  }
}
