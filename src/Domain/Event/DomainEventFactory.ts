import { DropboxBackupFailedEvent, DuplicateItemSyncedEvent, EmailArchiveExtensionSyncedEvent, EmailBackupAttachmentCreatedEvent, GoogleDriveBackupFailedEvent, ItemsSyncedEvent, MailBackupAttachmentTooBigEvent, OneDriveBackupFailedEvent, UserRegisteredEvent } from '@standardnotes/domain-events'
import * as dayjs from 'dayjs'
import { injectable } from 'inversify'
import { DomainEventFactoryInterface } from './DomainEventFactoryInterface'

@injectable()
export class DomainEventFactory implements DomainEventFactoryInterface {
  createDuplicateItemSyncedEvent(itemUuid: string, userUuid: string): DuplicateItemSyncedEvent {
    return {
      type: 'DUPLICATE_ITEM_SYNCED',
      createdAt: dayjs.utc().toDate(),
      payload: {
        itemUuid,
        userUuid,
      },
    }
  }

  createDropboxBackupFailedEvent(extensionSettingUuid: string, email: string): DropboxBackupFailedEvent {
    return {
      type: 'DROPBOX_BACKUP_FAILED',
      createdAt: dayjs.utc().toDate(),
      payload: {
        extensionSettingUuid,
        email,
      },
    }
  }

  createGoogleDriveBackupFailedEvent(extensionSettingUuid: string, email: string): GoogleDriveBackupFailedEvent {
    return {
      type: 'GOOGLE_DRIVE_BACKUP_FAILED',
      createdAt: dayjs.utc().toDate(),
      payload: {
        extensionSettingUuid,
        email,
      },
    }
  }

  createOneDriveBackupFailedEvent(extensionSettingUuid: string, email: string): OneDriveBackupFailedEvent {
    return {
      type: 'ONE_DRIVE_BACKUP_FAILED',
      createdAt: dayjs.utc().toDate(),
      payload: {
        extensionSettingUuid,
        email,
      },
    }
  }

  createMailBackupAttachmentTooBigEvent(dto: { allowedSize: string, attachmentSize: string, extensionSettingUuid: string, email: string }): MailBackupAttachmentTooBigEvent {
    return {
      type: 'MAIL_BACKUP_ATTACHMENT_TOO_BIG',
      createdAt: dayjs.utc().toDate(),
      payload: dto,
    }
  }

  createItemsSyncedEvent(dto: { userUuid: string, extensionUrl: string, extensionId: string, itemUuids: Array<string>, forceMute: boolean, skipFileBackup: boolean }): ItemsSyncedEvent {
    return {
      type: 'ITEMS_SYNCED',
      createdAt: dayjs.utc().toDate(),
      payload: dto,
    }
  }

  createUserRegisteredEvent(userUuid: string, email: string): UserRegisteredEvent {
    return {
      type: 'USER_REGISTERED',
      createdAt: dayjs.utc().toDate(),
      payload: {
        userUuid,
        email,
      },
    }
  }

  createEmailArchiveExtensionSyncedEvent(userUuid: string, extensionId: string): EmailArchiveExtensionSyncedEvent {
    return {
      type: 'EMAIL_ARCHIVE_EXTENSION_SYNCED',
      createdAt: dayjs.utc().toDate(),
      payload: {
        userUuid,
        extensionId,
      },
    }
  }

  createEmailBackupAttachmentCreatedEvent(backupFileName: string, email: string): EmailBackupAttachmentCreatedEvent {
    return {
      type: 'EMAIL_BACKUP_ATTACHMENT_CREATED',
      createdAt: dayjs.utc().toDate(),
      payload: {
        backupFileName,
        email,
      },
    }
  }
}
