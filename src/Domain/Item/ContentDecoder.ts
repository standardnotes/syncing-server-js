import { injectable } from 'inversify'
import { ContentDecoderInterface } from './ContentDecoderInterface'

@injectable()
export class ContentDecoder implements ContentDecoderInterface {
  decode(content: string): Record<string, unknown> {
    try {
      const contentBuffer = Buffer.from(content.substring(3), 'base64')
      const decodedContent = contentBuffer.toString()

      return JSON.parse(decodedContent)
    } catch (error) {
      return {}
    }
  }
}
