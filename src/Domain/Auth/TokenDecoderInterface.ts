export interface TokenDecoderInterface {
  decode(token: string): Record<string, unknown> | undefined
}
