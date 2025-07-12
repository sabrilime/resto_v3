import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRateToComments1700000000004 implements MigrationInterface {
    name = 'AddRateToComments1700000000004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" ADD "rate" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "rate"`);
    }
} 