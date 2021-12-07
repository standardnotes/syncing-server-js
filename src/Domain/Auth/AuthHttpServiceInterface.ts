import { KeyParams } from '@standardnotes/auth'
import { FeatureDescription } from '@standardnotes/features'

export interface AuthHttpServiceInterface {
  getUserKeyParams(dto: { email?: string, uuid?: string, authenticated: boolean }): Promise<KeyParams>
  getUserFeatures(userUuid: string): Promise<Array<FeatureDescription>>
}
