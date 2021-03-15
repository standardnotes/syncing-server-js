export type GetItemsDTO = {
  userUuid: string
  syncToken?: string
  cursorToken?: string
  limit?: number
  contentType?: string
}
