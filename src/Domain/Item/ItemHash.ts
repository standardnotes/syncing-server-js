export type ItemHash = {
  uuid: string
  content: string
  content_type: string
  deleted?: boolean
  duplicate_of?: string | null
  enc_item_key: string
  items_key_id: string
  created_at: string
  updated_at?: string
}
