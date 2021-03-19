export type ItemQuery = {
  userUuid: string
  sortBy: string
  limit: number
  lastSyncTime?: number
  contentType?: string
  deleted?: boolean
}
