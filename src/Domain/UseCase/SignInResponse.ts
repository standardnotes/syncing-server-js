export type SignInResponse = {
  success: boolean
  authResponse?: Record<string, unknown>
  errorMessage?: string
}
