import { MigrationInterface, QueryRunner } from "typeorm";

export class craeateTables1666705623294 implements MigrationInterface {
    name = 'craeateTables1666705623294'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "query" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "est_search_volume" integer, "esv_date" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_be23114e9d505264e2fdd227537" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "query_data" ("id" SERIAL NOT NULL, "date_start" TIMESTAMP NOT NULL, "date_end" TIMESTAMP NOT NULL, "clicks" integer, "impressions" integer, "ctr" double precision, "position" double precision, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "query_id" integer, CONSTRAINT "PK_8344e7502101a17727eb1052869" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "page" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_742f4117e065c5b6ad21b37ba1f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "page_data" ("id" SERIAL NOT NULL, "date_start" TIMESTAMP NOT NULL, "date_end" TIMESTAMP NOT NULL, "clicks" integer, "impressions" integer, "ctr" double precision, "position" double precision, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "query_id" integer, "page_id" integer, CONSTRAINT "PK_92e400106a9a2e561d5810e3a73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "query_data" ADD CONSTRAINT "FK_ab3add6b5283b704c7a088b22ed" FOREIGN KEY ("query_id") REFERENCES "query"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "page_data" ADD CONSTRAINT "FK_768575d50abc4e6dfe6750354f8" FOREIGN KEY ("query_id") REFERENCES "query"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "page_data" ADD CONSTRAINT "FK_82f6020e207e033aecd75ff2f6a" FOREIGN KEY ("page_id") REFERENCES "page"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "page_data" DROP CONSTRAINT "FK_82f6020e207e033aecd75ff2f6a"`);
        await queryRunner.query(`ALTER TABLE "page_data" DROP CONSTRAINT "FK_768575d50abc4e6dfe6750354f8"`);
        await queryRunner.query(`ALTER TABLE "query_data" DROP CONSTRAINT "FK_ab3add6b5283b704c7a088b22ed"`);
        await queryRunner.query(`DROP TABLE "page_data"`);
        await queryRunner.query(`DROP TABLE "page"`);
        await queryRunner.query(`DROP TABLE "query_data"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "query"`);
    }

}
