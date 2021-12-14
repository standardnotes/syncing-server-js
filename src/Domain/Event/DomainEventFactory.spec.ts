import 'reflect-metadata'

import { DomainEventFactory } from './DomainEventFactory'

describe('DomainEventFactory', () => {
  const createFactory = () => new DomainEventFactory()

  it('should create a USER_REGISTERED event', () => {
    expect(createFactory().createUserRegisteredEvent('1-2-3', 'test@test.te'))
      .toEqual({
        createdAt: expect.any(Date),
        meta: {
          correlation: {
            userIdentifier: '1-2-3',
            userIdentifierType: 'uuid',
          },
        },
        payload: {
          userUuid: '1-2-3',
          email: 'test@test.te',
        },
        type: 'USER_REGISTERED',
      })
  })

  it('should create a ITEMS_SYNCED event', () => {
    expect(createFactory().createItemsSyncedEvent({
      userUuid: '1-2-3',
      extensionUrl: 'https://test.com',
      extensionId: '2-3-4',
      itemUuids: ['3-4-5'],
      forceMute: false,
      skipFileBackup: false,
      source: 'backup',
    }))
      .toEqual({
        createdAt: expect.any(Date),
        meta: {
          correlation: {
            userIdentifier: '1-2-3',
            userIdentifierType: 'uuid',
          },
        },
        payload: {
          userUuid: '1-2-3',
          extensionUrl: 'https://test.com',
          extensionId: '2-3-4',
          itemUuids: [ '3-4-5' ],
          forceMute: false,
          skipFileBackup: false,
          source: 'backup',
        },
        type: 'ITEMS_SYNCED',
      })
  })

  it('should create a DROPBOX_BACKUP_FAILED event', () => {
    expect(createFactory().createDropboxBackupFailedEvent('1-2-3', 'test@test.com'))
      .toEqual({
        createdAt: expect.any(Date),
        meta: {
          correlation: {
            userIdentifier: 'test@test.com',
            userIdentifierType: 'email',
          },
        },
        payload: {
          email: 'test@test.com',
          muteCloudEmailsSettingUuid: '1-2-3',
        },
        type: 'DROPBOX_BACKUP_FAILED',
      })
  })

  it('should create a GOOGLE_DRIVE_BACKUP_FAILED event', () => {
    expect(createFactory().createGoogleDriveBackupFailedEvent('1-2-3', 'test@test.com'))
      .toEqual({
        createdAt: expect.any(Date),
        meta: {
          correlation: {
            userIdentifier: 'test@test.com',
            userIdentifierType: 'email',
          },
        },
        payload: {
          email: 'test@test.com',
          muteCloudEmailsSettingUuid: '1-2-3',
        },
        type: 'GOOGLE_DRIVE_BACKUP_FAILED',
      })
  })

  it('should create a ONE_DRIVE_BACKUP_FAILED event', () => {
    expect(createFactory().createOneDriveBackupFailedEvent('1-2-3', 'test@test.com'))
      .toEqual({
        createdAt: expect.any(Date),
        meta: {
          correlation: {
            userIdentifier: 'test@test.com',
            userIdentifierType: 'email',
          },
        },
        payload: {
          email: 'test@test.com',
          muteCloudEmailsSettingUuid: '1-2-3',
        },
        type: 'ONE_DRIVE_BACKUP_FAILED',
      })
  })

  it('should create a MAIL_BACKUP_ATTACHMENT_TOO_BIG event', () => {
    expect(createFactory().createMailBackupAttachmentTooBigEvent({
      allowedSize: '1000',
      attachmentSize: '1500',
      muteEmailsSettingUuid: '1-2-3',
      email: 'test@test.com',
    }))
      .toEqual({
        createdAt: expect.any(Date),
        meta: {
          correlation: {
            userIdentifier: 'test@test.com',
            userIdentifierType: 'email',
          },
        },
        payload: {
          email: 'test@test.com',
          muteEmailsSettingUuid: '1-2-3',
          allowedSize: '1000',
          attachmentSize: '1500',
        },
        type: 'MAIL_BACKUP_ATTACHMENT_TOO_BIG',
      })
  })

  it('should create a EMAIL_ARCHIVE_EXTENSION_SYNCED event', () => {
    expect(createFactory().createEmailArchiveExtensionSyncedEvent('1-2-3', '2-3-4'))
      .toEqual({
        createdAt: expect.any(Date),
        meta: {
          correlation: {
            userIdentifier: '1-2-3',
            userIdentifierType: 'uuid',
          },
        },
        payload: {
          userUuid: '1-2-3',
          extensionId: '2-3-4',
        },
        type: 'EMAIL_ARCHIVE_EXTENSION_SYNCED',
      })
  })

  it('should create a EMAIL_BACKUP_ATTACHMENT_CREATED event', () => {
    expect(createFactory().createEmailBackupAttachmentCreatedEvent('backup-file', 'test@test.com'))
      .toEqual({
        createdAt: expect.any(Date),
        meta: {
          correlation: {
            userIdentifier: 'test@test.com',
            userIdentifierType: 'email',
          },
        },
        payload: {
          backupFileName: 'backup-file',
          email: 'test@test.com',
        },
        type: 'EMAIL_BACKUP_ATTACHMENT_CREATED',
      })
  })

  it('should create a DUPLICATE_ITEM_SYNCED event', () => {
    expect(createFactory().createDuplicateItemSyncedEvent('1-2-3', '2-3-4'))
      .toEqual({
        createdAt: expect.any(Date),
        meta: {
          correlation: {
            userIdentifier: '2-3-4',
            userIdentifierType: 'uuid',
          },
        },
        payload: {
          itemUuid: '1-2-3',
          userUuid: '2-3-4',
        },
        type: 'DUPLICATE_ITEM_SYNCED',
      })
  })
})
