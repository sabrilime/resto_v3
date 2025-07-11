import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovePhoneWebsitePostedByAddressFromRestaurants1700000000003 implements MigrationInterface {
    name = 'RemovePhoneWebsitePostedByAddressFromRestaurants1700000000003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key constraints if they exist
        await queryRunner.query(`ALTER TABLE "restaurants" DROP CONSTRAINT IF EXISTS "FK_restaurants_address"`);
        await queryRunner.query(`ALTER TABLE "restaurants" DROP CONSTRAINT IF EXISTS "FK_restaurants_posted_by"`);
        // Remove columns
        await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN IF EXISTS "phone"`);
        await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN IF EXISTS "website"`);
        await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN IF EXISTS "posted_by"`);
        await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN IF EXISTS "address_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add columns back (without foreign keys for simplicity)
        await queryRunner.query(`ALTER TABLE "restaurants" ADD "phone" character varying`);
        await queryRunner.query(`ALTER TABLE "restaurants" ADD "website" character varying`);
        await queryRunner.query(`ALTER TABLE "restaurants" ADD "posted_by" integer`);
        await queryRunner.query(`ALTER TABLE "restaurants" ADD "address_id" integer`);
    }
} 