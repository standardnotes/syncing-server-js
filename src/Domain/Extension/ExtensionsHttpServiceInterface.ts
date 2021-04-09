import { SendItemsToExtensionsServerDTO } from './SendItemsToExtensionsServerDTO'

export interface ExtensionsHttpServiceInterface {
  sendItemsToExtensionsServer(dto: SendItemsToExtensionsServerDTO): Promise<void>
}
