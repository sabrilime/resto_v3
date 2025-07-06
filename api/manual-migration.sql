-- Add Google OAuth columns to users table
ALTER TABLE "users" ADD COLUMN "googleId" character varying;
ALTER TABLE "users" ADD COLUMN "provider" character varying NOT NULL DEFAULT 'local';

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('googleId', 'provider'); 