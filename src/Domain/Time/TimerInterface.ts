export interface TimerInterface {
  getTimestampInMicroseconds(): number
  convertStringDateToMicroseconds(date: string): number
  convertStringDateToMilliseconds(date: string): number
  convertMicrosecondsToMilliseconds(microseconds: number): number
}
