import { RoleName } from '@standardnotes/common'

export type SimpleRevisionProjection = {
  uuid: string
  content_type: string
  required_role: RoleName
  created_at: string
  updated_at: string
}
