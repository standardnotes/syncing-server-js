import * as uuid from 'uuid'
import { KeyParams } from '@standardnotes/auth'
import { S3 } from 'aws-sdk'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { Item } from '../../Domain/Item/Item'
import { ItemBackupServiceInterface } from '../../Domain/Item/ItemBackupServiceInterface'

@injectable()
export class S3ItemBackupService implements ItemBackupServiceInterface {
  constructor (
    @inject(TYPES.S3) private s3Client: S3,
    @inject(TYPES.S3_BACKUP_BUCKET_NAME) private s3BackupBucketName: string,
    @inject(TYPES.Logger) private logger: Logger
  ) {
  }

  async backup(items: Item[], authParams: KeyParams): Promise<string> {
    if (!this.s3BackupBucketName) {
      this.logger.warn('S3 backup bucket not configured')

      return ''
    }

    const fileName = uuid.v4()

    const uploadResult = await this.s3Client.upload({
      Bucket: this.s3BackupBucketName,
      Key: fileName,
      Body: JSON.stringify({
        items,
        auth_params: authParams,
      }),
    }).promise()

    return uploadResult.Key
  }

}
