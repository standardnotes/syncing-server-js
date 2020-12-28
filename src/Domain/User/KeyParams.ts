export type KeyParams = {
  [key: string]: string | number | undefined
  version: string
  identifier: string
  created?: string
  origination?: string
  pw_nonce?: string
  pw_cost?: number
  email?: string
  pw_salt?: string
  pw_alg?: string
  pw_func?: string
  pw_key_size?: number
}
