export interface ContentDecoderInterface {
  decode(content: string): Record<string, unknown>
}
