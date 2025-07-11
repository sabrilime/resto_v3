import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAddressTableAndUpdateRestaurants1700000000001 implements MigrationInterface {
    name = 'CreateAddressTableAndUpdateRestaurants1700000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create addresses table
        await queryRunner.query(`
            CREATE TABLE "addresses" (
                "id" SERIAL NOT NULL,
                "house_number" character varying,
                "street" character varying NOT NULL,
                "postal_code" character varying NOT NULL,
                "city" character varying NOT NULL,
                "insee_code" character varying,
                "latitude" decimal(10,8),
                "longitude" decimal(11,8),
                "onlyDelivery" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_745d8f43d3af10df31d31fd1f40" PRIMARY KEY ("id")
            )
        `);

        // Add new columns to restaurants table
        await queryRunner.query(`ALTER TABLE "restaurants" ADD "instagram" character varying`);
        await queryRunner.query(`ALTER TABLE "restaurants" ADD "halal" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "restaurants" ADD "postedByUserId" integer`);
        await queryRunner.query(`ALTER TABLE "restaurants" ADD "addressId" integer`);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "restaurants" 
            ADD CONSTRAINT "FK_restaurants_posted_by" 
            FOREIGN KEY ("postedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "restaurants" 
            ADD CONSTRAINT "FK_restaurants_address" 
            FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        // Remove old address column (if it exists)
        await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN IF EXISTS "address"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add back the old address column
        await queryRunner.query(`ALTER TABLE "restaurants" ADD "address" character varying NOT NULL`);

        // Remove foreign key constraints
        await queryRunner.query(`ALTER TABLE "restaurants" DROP CONSTRAINT "FK_restaurants_address"`);
        await queryRunner.query(`ALTER TABLE "restaurants" DROP CONSTRAINT "FK_restaurants_posted_by"`);

        // Remove new columns from restaurants table
        await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "addressId"`);
        await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "postedByUserId"`);
        await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "halal"`);
        await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "instagram"`);

        // Drop addresses table
        await queryRunner.query(`DROP TABLE "addresses"`);
    }
} 