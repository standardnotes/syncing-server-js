import { MigrationInterface, QueryRunner } from 'typeorm'

export class addRetrievedRevokedSession1610719387757 implements MigrationInterface {
  name = 'addRetrievedRevokedSession1610719387757'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `revoked_sessions` ADD `retrieved` tinyint(1) NOT NULL DEFAULT \'0\'')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `revoked_sessions` DROP COLUMN `retrieved`')
  }
}
