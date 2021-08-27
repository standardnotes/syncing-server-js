import { MigrationInterface, QueryRunner } from 'typeorm'

export class dropUnusedIndexes1629964808297 implements MigrationInterface {
  name = 'dropUnusedIndexes1629964808297'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `items` DROP INDEX index_items_on_user_uuid_and_updated_at_and_created_at')
    await queryRunner.query('ALTER TABLE `items` DROP INDEX index_items_on_updated_at')
  }

  public async down(): Promise<void> {
    return
  }
}
