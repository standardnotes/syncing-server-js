export type RegisterDTO = {
  email: string
  password: string
  updatedWithUserAgent: string
  apiVersion: string
  pwFunc?: string
  pwAlg?: string
  pwCost?: number
  pwKeySize?: number
  pwNonce?: string
  pwSalt?: string
  kpOrigination?: string
  kpCreated?: Date
  version?: string
}
