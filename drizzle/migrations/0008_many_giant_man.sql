DROP TABLE "fingerprints" CASCADE;--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "password_hash" text NOT NULL;