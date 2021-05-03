export interface TimerInterface {
  getTimestampInMicroseconds(): number
  getUTCDate(): Date
  convertStringDateToDate(date: string): Date
  convertStringDateToMicroseconds(date: string): number
  convertStringDateToMilliseconds(date: string): number
  convertMicrosecondsToMilliseconds(microseconds: number): number
  convertMicrosecondsToSeconds(microseconds: number): number
  convertMicrosecondsToStringDate(microseconds: number): string
}
