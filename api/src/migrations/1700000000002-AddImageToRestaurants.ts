import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageToRestaurants1700000000002 implements MigrationInterface {
    name = 'AddImageToRestaurants1700000000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "image" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "image"`);
    }
} 