export interface ServiceTransitionHelperInterface {
  userHasMovedMFAToUserSettings(userUuid: string): Promise<boolean>
  markUserMFAAsMovedToUserSettings(userUuid: string, updatedAt: number): Promise<void>
  deleteUserMFAAsUserSetting(userUuid: string): Promise<void>
  getUserMFAUpdatedAtTimestamp(userUuid: string): Promise<number>
}
