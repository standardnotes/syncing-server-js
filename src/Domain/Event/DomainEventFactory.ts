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
      meta: {
        correlation: {
          userIdentifier: userUuid,
          userIdentifierType: 'uuid',
        },
      },
      payload: {
        itemUuid,
        userUuid,
      },
    }
  }

  createDropboxBackupFailedEvent(muteCloudEmailsSettingUuid: string, email: string): DropboxBackupFailedEvent {
    return {
      type: 'DROPBOX_BACKUP_FAILED',
      createdAt: dayjs.utc().toDate(),
      meta: {
        correlation: {
          userIdentifier: email,
          userIdentifierType: 'email',
        },
      },
      payload: {
        muteCloudEmailsSettingUuid,
        email,
      },
    }
  }

  createGoogleDriveBackupFailedEvent(muteCloudEmailsSettingUuid: string, email: string): GoogleDriveBackupFailedEvent {
    return {
      type: 'GOOGLE_DRIVE_BACKUP_FAILED',
      createdAt: dayjs.utc().toDate(),
      meta: {
        correlation: {
          userIdentifier: email,
          userIdentifierType: 'email',
        },
      },
      payload: {
        muteCloudEmailsSettingUuid,
        email,
      },
    }
  }

  createOneDriveBackupFailedEvent(muteCloudEmailsSettingUuid: string, email: string): OneDriveBackupFailedEvent {
    return {
      type: 'ONE_DRIVE_BACKUP_FAILED',
      createdAt: dayjs.utc().toDate(),
      meta: {
        correlation: {
          userIdentifier: email,
          userIdentifierType: 'email',
        },
      },
      payload: {
        muteCloudEmailsSettingUuid,
        email,
      },
    }
  }

  createMailBackupAttachmentTooBigEvent(dto: {
    allowedSize: string,
    attachmentSize: string,
    muteEmailsSettingUuid: string,
    email: string
  }): MailBackupAttachmentTooBigEvent {
    return {
      type: 'MAIL_BACKUP_ATTACHMENT_TOO_BIG',
      createdAt: dayjs.utc().toDate(),
      meta: {
        correlation: {
          userIdentifier: dto.email,
          userIdentifierType: 'email',
        },
      },
      payload: dto,
    }
  }

  createItemsSyncedEvent(dto: {
    userUuid: string,
    extensionUrl: string,
    extensionId: string,
    itemUuids: Array<string>,
    forceMute: boolean,
    skipFileBackup: boolean,
    source: 'backup' | 'account-deletion' | 'realtime-extensions-sync' | 'daily-extensions-sync'
  }): ItemsSyncedEvent {
    return {
      type: 'ITEMS_SYNCED',
      createdAt: dayjs.utc().toDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userUuid,
          userIdentifierType: 'uuid',
        },
      },
      payload: dto,
    }
  }

  createUserRegisteredEvent(userUuid: string, email: string): UserRegisteredEvent {
    return {
      type: 'USER_REGISTERED',
      createdAt: dayjs.utc().toDate(),
      meta: {
        correlation: {
          userIdentifier: userUuid,
          userIdentifierType: 'uuid',
        },
      },
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
      meta: {
        correlation: {
          userIdentifier: userUuid,
          userIdentifierType: 'uuid',
        },
      },
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
      meta: {
        correlation: {
          userIdentifier: email,
          userIdentifierType: 'email',
        },
      },
      payload: {
        backupFileName,
        email,
      },
    }
  }
}
