export interface LockRepositoryInterface {
  resetLockCounter(userUuid: string): Promise<void>
  updateLockCounter(userUuid: string, counter: number): Promise<void>
  getLockCounter(userUuid: string): Promise<number>
  lockUser(userUuid: string): Promise<void>
  isUserLocked(userUuid: string): Promise<boolean>
}
