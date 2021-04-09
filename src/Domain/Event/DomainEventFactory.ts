import { DomainEventFactoryInterface, DropboxBackupFailedEvent, GoogleDriveBackupFailedEvent, ItemsSyncedEvent, MailBackupAttachmentTooBigEvent, OneDriveBackupFailedEvent, UserRegisteredEvent } from '@standardnotes/domain-events'
import * as dayjs from 'dayjs'
import { injectable } from 'inversify'

@injectable()
export class DomainEventFactory implements DomainEventFactoryInterface {
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

  createMailBackupAttachmentTooBigEvent(allowedSize: string, attachmentSize: string, extensionSettingUuid: string, email: string): MailBackupAttachmentTooBigEvent {
    return {
      type: 'MAIL_BACKUP_ATTACHMENT_TOO_BIG',
      createdAt: dayjs.utc().toDate(),
      payload: {
        extensionSettingUuid,
        email,
        allowedSize,
        attachmentSize,
      },
    }
  }

  createItemsSyncedEvent(userUuid: string, extensionUrl: string, extensionId: string, itemUuids: string[], forceMute: boolean): ItemsSyncedEvent {
    return {
      type: 'ITEMS_SYNCED',
      createdAt: dayjs.utc().toDate(),
      payload: {
        userUuid,
        extensionUrl,
        extensionId,
        itemUuids,
        forceMute,
      },
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
}
