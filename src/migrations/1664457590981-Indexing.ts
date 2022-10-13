import { MigrationInterface, QueryRunner } from "typeorm";

export class Indexing1664457590981 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `keywords` ADD INDEX `idx_keywords_key` (`name`), ENGINE=InnoDB"
    );

    await queryRunner.query(
      "ALTER TABLE `keywords` ADD INDEX `idx_keywords_url` (`url`), ENGINE=InnoDB"
    );

    await queryRunner.query(
      "ALTER TABLE `keywords` ADD INDEX `idx_keywords_created_at` (`created_at`), ENGINE=InnoDB"
    );

     await queryRunner.query(
       "ALTER TABLE `urls` ADD INDEX `idx_urls_key` (`keywordId`), ENGINE=InnoDB"
     );

     await queryRunner.query(
       "ALTER TABLE `urls` ADD INDEX `idx_urls_url` (`name`), ENGINE=InnoDB"
     );

     await queryRunner.query(
       "ALTER TABLE `urls` ADD INDEX `idx_urls_created_at` (`created_at`), ENGINE=InnoDB"
     );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP INDEX `idx_keywords_key` ON `keywords`");
    await queryRunner.query("DROP INDEX `idx_keywords_url` ON `keywords`");
    await queryRunner.query(
      "DROP INDEX `idx_keywords_created_at` ON `keywords`"
    );
  }
}
