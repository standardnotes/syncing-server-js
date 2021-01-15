import { MigrationInterface, QueryRunner } from 'typeorm'

export class addReceivedRevokedSession1610719387757 implements MigrationInterface {
  name = 'addReceivedRevokedSession1610719387757'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `revoked_sessions` ADD `received` tinyint(1) NOT NULL DEFAULT \'0\'')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `revoked_sessions` DROP COLUMN `received`')
  }
}
