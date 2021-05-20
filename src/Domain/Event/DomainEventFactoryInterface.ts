import { DropboxBackupFailedEvent, DuplicateItemSyncedEvent, EmailArchiveExtensionSyncedEvent, EmailBackupAttachmentCreatedEvent, GoogleDriveBackupFailedEvent, ItemsSyncedEvent, MailBackupAttachmentTooBigEvent, OneDriveBackupFailedEvent, UserRegisteredEvent } from '@standardnotes/domain-events'

export interface DomainEventFactoryInterface {
  createUserRegisteredEvent(userUuid: string, email: string): UserRegisteredEvent
  createDropboxBackupFailedEvent(extensionSettingUuid: string, email: string): DropboxBackupFailedEvent
  createGoogleDriveBackupFailedEvent(extensionSettingUuid: string, email: string): GoogleDriveBackupFailedEvent
  createOneDriveBackupFailedEvent(extensionSettingUuid: string, email: string): OneDriveBackupFailedEvent
  createMailBackupAttachmentTooBigEvent(dto: { allowedSize: string, attachmentSize: string, extensionSettingUuid: string, email: string }): MailBackupAttachmentTooBigEvent
  createItemsSyncedEvent(dto: { userUuid: string, extensionUrl: string, extensionId: string, itemUuids: Array<string>, forceMute: boolean, skipFileBackup: boolean }): ItemsSyncedEvent
  createEmailArchiveExtensionSyncedEvent(userUuid: string, extensionId: string): EmailArchiveExtensionSyncedEvent
  createEmailBackupAttachmentCreatedEvent(backupFileName: string, email: string): EmailBackupAttachmentCreatedEvent
  createDuplicateItemSyncedEvent(itemUuid: string, userUuid: string): DuplicateItemSyncedEvent
}
