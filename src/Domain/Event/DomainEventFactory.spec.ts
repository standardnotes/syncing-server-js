import 'reflect-metadata'

import { DomainEventFactory } from './DomainEventFactory'

describe('DomainEventFactory', () => {
  const createFactory = () => new DomainEventFactory()

  it('should create a USER_REGISTERED event', () => {
    expect(createFactory().createUserRegisteredEvent('1-2-3', 'test@test.te'))
      .toEqual({
        createdAt: expect.any(Date),
        payload: {
          userUuid: '1-2-3',
          email: 'test@test.te',
        },
        type: 'USER_REGISTERED',
      })
  })

  it('should create a ITEMS_SYNCED event', () => {
    expect(createFactory().createItemsSyncedEvent('1-2-3', 'https://test.com', '2-3-4', ['3-4-5'], false))
      .toEqual({
        createdAt: expect.any(Date),
        payload: {
          userUuid: '1-2-3',
          extensionUrl: 'https://test.com',
          extensionId: '2-3-4',
          itemUuids: [ '3-4-5' ],
          forceMute: false,
        },
        type: 'ITEMS_SYNCED',
      })
  })

  it('should create a DROPBOX_BACKUP_FAILED event', () => {
    expect(createFactory().createDropboxBackupFailedEvent('1-2-3', 'test@test.com'))
      .toEqual({
        createdAt: expect.any(Date),
        payload: {
          email: 'test@test.com',
          extensionSettingUuid: '1-2-3',
        },
        type: 'DROPBOX_BACKUP_FAILED',
      })
  })

  it('should create a GOOGLE_DRIVE_BACKUP_FAILED event', () => {
    expect(createFactory().createGoogleDriveBackupFailedEvent('1-2-3', 'test@test.com'))
      .toEqual({
        createdAt: expect.any(Date),
        payload: {
          email: 'test@test.com',
          extensionSettingUuid: '1-2-3',
        },
        type: 'GOOGLE_DRIVE_BACKUP_FAILED',
      })
  })

  it('should create a ONE_DRIVE_BACKUP_FAILED event', () => {
    expect(createFactory().createOneDriveBackupFailedEvent('1-2-3', 'test@test.com'))
      .toEqual({
        createdAt: expect.any(Date),
        payload: {
          email: 'test@test.com',
          extensionSettingUuid: '1-2-3',
        },
        type: 'ONE_DRIVE_BACKUP_FAILED',
      })
  })

  it('should create a MAIL_BACKUP_ATTACHMENT_TOO_BIG event', () => {
    expect(createFactory().createMailBackupAttachmentTooBigEvent('1000', '1500', '1-2-3', 'test@test.com'))
      .toEqual({
        createdAt: expect.any(Date),
        payload: {
          email: 'test@test.com',
          extensionSettingUuid: '1-2-3',
          allowedSize: '1000',
          attachmentSize: '1500',
        },
        type: 'MAIL_BACKUP_ATTACHMENT_TOO_BIG',
      })
  })
})
