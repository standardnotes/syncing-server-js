export type ItemQuery = {
  userUuid: string
  sortBy: string
  sortOrder: 'ASC' | 'DESC'
  lastSyncTime?: number
  syncTimeComparison?: '>' | '>='
  contentType?: string
  deleted?: boolean
}
