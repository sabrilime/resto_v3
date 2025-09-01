import { MigrationInterface, QueryRunner } from "typeorm";

export class SyncSchemaWithNeon1751989020249 implements MigrationInterface {
    name = 'SyncSchemaWithNeon1751989020249'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check and add rate column if it doesn't exist
        const hasRateColumn = await queryRunner.hasColumn("comments", "rate");
        if (!hasRateColumn) {
            await queryRunner.query(`ALTER TABLE "comments" ADD "rate" integer`);
        }

        // Check and add other columns that might be missing
        const hasImageColumn = await queryRunner.hasColumn("restaurants", "image");
        if (!hasImageColumn) {
            await queryRunner.query(`ALTER TABLE "restaurants" ADD "image" character varying`);
        }

        // Check if address table exists
        const hasAddressTable = await queryRunner.hasTable("addresses");
        if (!hasAddressTable) {
            await queryRunner.query(`
                CREATE TABLE "addresses" (
                    "id" SERIAL PRIMARY KEY,
                    "house_number" character varying,
                    "street" character varying NOT NULL,
                    "postal_code" character varying NOT NULL,
                    "city" character varying NOT NULL,
                    "insee_code" character varying,
                    "latitude" double precision,
                    "longitude" double precision,
                    "onlyDelivery" boolean DEFAULT false,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
                )
            `);
        }

        console.log("Schema synchronization completed");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // This migration is for schema sync, no rollback needed
        console.log("Schema sync migration cannot be rolled back");
    }
}
