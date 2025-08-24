import { MigrationInterface, QueryRunner } from "typeorm";
import * as bodyParser from 'body-parser';

export class AddRateToComments1700000000004 implements MigrationInterface {
    name = 'AddRateToComments1700000000004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the rate column already exists
        const hasColumn = await queryRunner.hasColumn("comments", "rate");
        if (!hasColumn) {
            await queryRunner.query(`ALTER TABLE "comments" ADD "rate" integer`);
        } else {
            console.log("Rate column already exists, skipping...");
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "rate"`);
    }
} 