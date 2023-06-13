import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1686657584515 implements MigrationInterface {
    name = 'migration1686657584515'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "clusters" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "parentId" integer, CONSTRAINT "UQ_9866753a0c6ffd4adebb5cc236b" UNIQUE ("name"), CONSTRAINT "PK_56c8e201f375e1e961dcdd6831c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "page_data" ("id" SERIAL NOT NULL, "date_start" TIMESTAMP, "date_end" TIMESTAMP, "clicks" integer, "impressions" integer, "ctr" double precision, "position" double precision, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "query_id" integer, "page_id" integer, CONSTRAINT "PK_92e400106a9a2e561d5810e3a73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_pair_data_id" ON "page_data" ("id") `);
        await queryRunner.query(`CREATE TABLE "page" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b82c19c08afb292de4600d99e4f" UNIQUE ("name"), CONSTRAINT "PK_742f4117e065c5b6ad21b37ba1f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_page_id" ON "page" ("id") `);
        await queryRunner.query(`CREATE INDEX "idx_page_name" ON "page" ("name") `);
        await queryRunner.query(`CREATE TABLE "query_data" ("id" SERIAL NOT NULL, "date_start" TIMESTAMP, "date_end" TIMESTAMP, "clicks" integer, "typ" character varying, "impressions" integer, "ctr" double precision, "position" double precision, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "query_id" integer, CONSTRAINT "PK_8344e7502101a17727eb1052869" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_query_data_id" ON "query_data" ("id") `);
        await queryRunner.query(`CREATE TABLE "query" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "est_search_volume" integer, "typ" character varying, "relevant" boolean, "esv_date" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "clusterId" integer, "designated" integer, CONSTRAINT "UQ_8500d3b8fbf208a0ea25475e585" UNIQUE ("name"), CONSTRAINT "PK_be23114e9d505264e2fdd227537" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_query_id" ON "query" ("id") `);
        await queryRunner.query(`CREATE INDEX "idx_query_name" ON "query" ("name") `);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "clusters" ADD CONSTRAINT "FK_d7c37675469a2b8bbbe44249851" FOREIGN KEY ("parentId") REFERENCES "clusters"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "page_data" ADD CONSTRAINT "FK_768575d50abc4e6dfe6750354f8" FOREIGN KEY ("query_id") REFERENCES "query"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "page_data" ADD CONSTRAINT "FK_82f6020e207e033aecd75ff2f6a" FOREIGN KEY ("page_id") REFERENCES "page"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "query_data" ADD CONSTRAINT "FK_ab3add6b5283b704c7a088b22ed" FOREIGN KEY ("query_id") REFERENCES "query"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "query" ADD CONSTRAINT "FK_083484832a23fb550f1d246d0dc" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "query" ADD CONSTRAINT "FK_4b7785533039ec3b1b20bbd9d0c" FOREIGN KEY ("designated") REFERENCES "page"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "query" DROP CONSTRAINT "FK_4b7785533039ec3b1b20bbd9d0c"`);
        await queryRunner.query(`ALTER TABLE "query" DROP CONSTRAINT "FK_083484832a23fb550f1d246d0dc"`);
        await queryRunner.query(`ALTER TABLE "query_data" DROP CONSTRAINT "FK_ab3add6b5283b704c7a088b22ed"`);
        await queryRunner.query(`ALTER TABLE "page_data" DROP CONSTRAINT "FK_82f6020e207e033aecd75ff2f6a"`);
        await queryRunner.query(`ALTER TABLE "page_data" DROP CONSTRAINT "FK_768575d50abc4e6dfe6750354f8"`);
        await queryRunner.query(`ALTER TABLE "clusters" DROP CONSTRAINT "FK_d7c37675469a2b8bbbe44249851"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP INDEX "public"."idx_query_name"`);
        await queryRunner.query(`DROP INDEX "public"."idx_query_id"`);
        await queryRunner.query(`DROP TABLE "query"`);
        await queryRunner.query(`DROP INDEX "public"."idx_query_data_id"`);
        await queryRunner.query(`DROP TABLE "query_data"`);
        await queryRunner.query(`DROP INDEX "public"."idx_page_name"`);
        await queryRunner.query(`DROP INDEX "public"."idx_page_id"`);
        await queryRunner.query(`DROP TABLE "page"`);
        await queryRunner.query(`DROP INDEX "public"."idx_pair_data_id"`);
        await queryRunner.query(`DROP TABLE "page_data"`);
        await queryRunner.query(`DROP TABLE "clusters"`);
    }

}
