export type ItemProjection = {
  uuid: string
  items_key_id: string
  duplicate_of: string | null
  enc_item_key: string | null
  content: string | null
  content_type: string
  auth_hash: string | null
  deleted: boolean
  created_at: string
  updated_at: string
}
