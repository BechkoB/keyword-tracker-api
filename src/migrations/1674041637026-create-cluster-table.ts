import { MigrationInterface, QueryRunner } from "typeorm";

export class createClusterTable1674041637026 implements MigrationInterface {
    name = 'createClusterTable1674041637026'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "clusters" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "parentId" integer, CONSTRAINT "UQ_9866753a0c6ffd4adebb5cc236b" UNIQUE ("name"), CONSTRAINT "PK_56c8e201f375e1e961dcdd6831c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "query" ADD "clusterId" integer`);
        await queryRunner.query(`ALTER TABLE "clusters" ADD CONSTRAINT "FK_d7c37675469a2b8bbbe44249851" FOREIGN KEY ("parentId") REFERENCES "clusters"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "query" ADD CONSTRAINT "FK_083484832a23fb550f1d246d0dc" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "query" DROP CONSTRAINT "FK_083484832a23fb550f1d246d0dc"`);
        await queryRunner.query(`ALTER TABLE "clusters" DROP CONSTRAINT "FK_d7c37675469a2b8bbbe44249851"`);
        await queryRunner.query(`ALTER TABLE "query" DROP COLUMN "clusterId"`);
        await queryRunner.query(`DROP TABLE "clusters"`);
    }

}
