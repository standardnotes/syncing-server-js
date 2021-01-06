import { MigrationInterface, QueryRunner } from 'typeorm'

export class addArchivedSessions1610015065194 implements MigrationInterface {
    name = 'addArchivedSessions1610015065194'

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('CREATE TABLE `archived_sessions` (`uuid` varchar(36) NOT NULL, `user_uuid` varchar(255) NOT NULL, `created_at` datetime NOT NULL, INDEX `index_archived_sessions_on_user_uuid` (`user_uuid`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB')
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('DROP INDEX `index_archived_sessions_on_user_uuid` ON `archived_sessions`')
      await queryRunner.query('DROP TABLE `archived_sessions`')
    }
}
