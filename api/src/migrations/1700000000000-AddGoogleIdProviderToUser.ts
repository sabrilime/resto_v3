import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGoogleIdProviderToUser1700000000000 implements MigrationInterface {
    name = 'AddGoogleIdProviderToUser1700000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "googleId" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "provider" character varying NOT NULL DEFAULT 'local'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "provider"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "googleId"`);
    }
} 