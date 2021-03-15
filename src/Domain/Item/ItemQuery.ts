export type ItemQuery = {
  userUuid: string
  sortBy: string
  limit: number
  lastSyncTime?: Date
  contentType?: string
  deleted?: boolean
}
