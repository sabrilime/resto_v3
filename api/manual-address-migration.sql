-- Create addresses table
CREATE TABLE IF NOT EXISTS "addresses" (
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
);

-- Add new columns to restaurants table
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "instagram" character varying;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "halal" boolean NOT NULL DEFAULT false;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "postedByUserId" integer;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "addressId" integer;

-- Add foreign key constraints (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_restaurants_posted_by') THEN
        ALTER TABLE "restaurants" 
        ADD CONSTRAINT "FK_restaurants_posted_by" 
        FOREIGN KEY ("postedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_restaurants_address') THEN
        ALTER TABLE "restaurants" 
        ADD CONSTRAINT "FK_restaurants_address" 
        FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
    END IF;
END $$;

-- Remove old address column if it exists
ALTER TABLE "restaurants" DROP COLUMN IF EXISTS "address";

-- Verify the changes
SELECT 'Addresses table created successfully' as status;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'addresses' 
ORDER BY ordinal_position;

SELECT 'Restaurants table updated successfully' as status;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
AND column_name IN ('instagram', 'halal', 'postedByUserId', 'addressId')
ORDER BY ordinal_position; 