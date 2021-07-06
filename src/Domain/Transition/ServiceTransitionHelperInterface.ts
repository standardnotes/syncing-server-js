export interface ServiceTransitionHelperInterface {
  userHasMovedMFAToUserSettings(userUuid: string): Promise<{ status: 'active' | 'deleted' | 'not found' }>
  markUserMFAAsMovedToUserSettings(userUuid: string, updatedAt: number): Promise<void>
  markUserMFAAsUserSettingAsDeleted(userUuid: string, updatedAt: number): Promise<void>
  getUserMFAUpdatedAtTimestamp(userUuid: string): Promise<number>
}
