import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNeonTables1751989030000 implements MigrationInterface {
    name = 'CreateNeonTables1751989030000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create users table if it doesn't exist
        const hasUsersTable = await queryRunner.hasTable("users");
        if (!hasUsersTable) {
            await queryRunner.query(`
                CREATE TABLE "users" (
                    "id" SERIAL PRIMARY KEY,
                    "email" character varying NOT NULL UNIQUE,
                    "password" character varying,
                    "firstName" character varying NOT NULL,
                    "lastName" character varying NOT NULL,
                    "role" character varying NOT NULL DEFAULT 'user',
                    "isActive" boolean NOT NULL DEFAULT true,
                    "googleId" character varying,
                    "provider" character varying DEFAULT 'local',
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
                )
            `);
            console.log("Users table created");
        } else {
            console.log("Users table already exists, skipping...");
        }

        // Create addresses table if it doesn't exist
        const hasAddressesTable = await queryRunner.hasTable("addresses");
        if (!hasAddressesTable) {
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
            console.log("Addresses table created");
        } else {
            console.log("Addresses table already exists, skipping...");
        }

        // Create specialities table if it doesn't exist
        const hasSpecialitiesTable = await queryRunner.hasTable("specialities");
        if (!hasSpecialitiesTable) {
            await queryRunner.query(`
                CREATE TABLE "specialities" (
                    "id" SERIAL PRIMARY KEY,
                    "name" character varying NOT NULL UNIQUE,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
                )
            `);
            console.log("Specialities table created");
        } else {
            console.log("Specialities table already exists, skipping...");
        }

        // Create restaurants table if it doesn't exist
        const hasRestaurantsTable = await queryRunner.hasTable("restaurants");
        if (!hasRestaurantsTable) {
            await queryRunner.query(`
                CREATE TABLE "restaurants" (
                    "id" SERIAL PRIMARY KEY,
                    "name" character varying NOT NULL,
                    "description" text,
                    "addressId" integer,
                    "image" character varying,
                    "latitude" double precision,
                    "longitude" double precision,
                    "rating" double precision,
                    "status" character varying NOT NULL DEFAULT 'active',
                    "postedById" integer,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "fk_restaurant_address" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE SET NULL,
                    CONSTRAINT "fk_restaurant_user" FOREIGN KEY ("postedById") REFERENCES "users"("id") ON DELETE SET NULL
                )
            `);
            console.log("Restaurants table created");
        } else {
            console.log("Restaurants table already exists, skipping...");
        }

        // Create restaurant_specialities junction table if it doesn't exist
        const hasRestaurantSpecialitiesTable = await queryRunner.hasTable("restaurant_specialities");
        if (!hasRestaurantSpecialitiesTable) {
            await queryRunner.query(`
                CREATE TABLE "restaurant_specialities" (
                    "restaurantId" integer NOT NULL,
                    "specialityId" integer NOT NULL,
                    CONSTRAINT "pk_restaurant_specialities" PRIMARY KEY ("restaurantId", "specialityId"),
                    CONSTRAINT "fk_restaurant_specialities_restaurant" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE,
                    CONSTRAINT "fk_restaurant_specialities_speciality" FOREIGN KEY ("specialityId") REFERENCES "specialities"("id") ON DELETE CASCADE
                )
            `);
            console.log("Restaurant_specialities table created");
        } else {
            console.log("Restaurant_specialities table already exists, skipping...");
        }

        // Create comments table if it doesn't exist
        const hasCommentsTable = await queryRunner.hasTable("comments");
        if (!hasCommentsTable) {
            await queryRunner.query(`
                CREATE TABLE "comments" (
                    "id" SERIAL PRIMARY KEY,
                    "content" text NOT NULL,
                    "rate" integer,
                    "restaurantId" integer NOT NULL,
                    "userId" integer NOT NULL,
                    "image" character varying,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "fk_comment_restaurant" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE,
                    CONSTRAINT "fk_comment_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
                )
            `);
            console.log("Comments table created");
        } else {
            console.log("Comments table already exists, skipping...");
        }

        // Create favourites table if it doesn't exist
        const hasFavouritesTable = await queryRunner.hasTable("favourites");
        if (!hasFavouritesTable) {
            await queryRunner.query(`
                CREATE TABLE "favourites" (
                    "id" SERIAL PRIMARY KEY,
                    "userId" integer NOT NULL,
                    "restaurantId" integer NOT NULL,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "fk_favourite_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
                    CONSTRAINT "fk_favourite_restaurant" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE,
                    CONSTRAINT "unique_user_restaurant_favourite" UNIQUE ("userId", "restaurantId")
                )
            `);
            console.log("Favourites table created");
        } else {
            console.log("Favourites table already exists, skipping...");
        }

        console.log("All tables created successfully!");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order (respecting foreign key constraints)
        await queryRunner.query(`DROP TABLE "favourites"`);
        await queryRunner.query(`DROP TABLE "comments"`);
        await queryRunner.query(`DROP TABLE "restaurant_specialities"`);
        await queryRunner.query(`DROP TABLE "restaurants"`);
        await queryRunner.query(`DROP TABLE "specialities"`);
        await queryRunner.query(`DROP TABLE "addresses"`);
        await queryRunner.query(`DROP TABLE "users"`);
        
        console.log("All tables dropped successfully!");
    }
}



