import 'reflect-metadata'

import { KeyParams } from '@standardnotes/auth'
import { S3 } from 'aws-sdk'
import { Logger } from 'winston'
import { Item } from '../../Domain/Item/Item'
import { S3ItemBackupService } from './S3ItemBackupService'

describe('S3ItemBackupService', () => {
  let s3Client: S3
  let s3BackupBucketName = 'backup-bucket'
  let logger: Logger
  let item: Item
  let keyParams: KeyParams

  const createService = () => new S3ItemBackupService(s3Client, s3BackupBucketName, logger)

  beforeEach(() => {
    s3Client = {} as jest.Mocked<S3>
    s3Client.upload = jest.fn()

    logger = {} as jest.Mocked<Logger>
    logger.warn = jest.fn()

    item = {} as jest.Mocked<Item>

    keyParams = {} as jest.Mocked<KeyParams>
  })

  it('should upload items to S3 as a backup file', async () => {
    await createService().backup([ item ], keyParams)

    expect(s3Client.upload).toHaveBeenCalledWith({
      Body: '{"items":[{}],"auth_params":{}}',
      Bucket: 'backup-bucket',
      Key: expect.any(String),
    })
  })

  it('should not upload items to S3 if bucket name is not configured', async () => {
    s3BackupBucketName = ''
    await createService().backup([ item ], keyParams)

    expect(s3Client.upload).not.toHaveBeenCalled()
  })
})
