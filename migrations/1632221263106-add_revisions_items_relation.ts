import { MigrationInterface, QueryRunner } from 'typeorm'

export class addRevisionsItemsRelation1632221263106 implements MigrationInterface {
  name = 'addRevisionsItemsRelation1632221263106'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `index_revisions_on_item_uuid` ON `revisions`')
    await queryRunner.query('ALTER TABLE `revisions` CHANGE `item_uuid` `item_uuid` varchar(255) NOT NULL')
    await queryRunner.query('ALTER TABLE `items` CHANGE `user_uuid` `user_uuid` varchar(255) NOT NULL')
    await queryRunner.query('ALTER TABLE `revisions` ADD CONSTRAINT `FK_ab3b92e54701fe3010022a31d90` FOREIGN KEY (`item_uuid`) REFERENCES `items`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `revisions` DROP FOREIGN KEY `FK_ab3b92e54701fe3010022a31d90`')
    await queryRunner.query('ALTER TABLE `items` CHANGE `user_uuid` `user_uuid` varchar(255) NULL')
    await queryRunner.query('ALTER TABLE `revisions` CHANGE `item_uuid` `item_uuid` varchar(255) NULL')
    await queryRunner.query('CREATE INDEX `index_revisions_on_item_uuid` ON `revisions` (`item_uuid`)')
  }
}
