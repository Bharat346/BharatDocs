ALTER TABLE "access_logs" DROP CONSTRAINT "access_logs_fingerprint_id_fingerprints_id_fk";
--> statement-breakpoint
ALTER TABLE "access_logs" ADD COLUMN "status" text NOT NULL;--> statement-breakpoint
ALTER TABLE "access_logs" ADD COLUMN "country_code" text;--> statement-breakpoint
ALTER TABLE "access_logs" ADD COLUMN "region" text;--> statement-breakpoint
ALTER TABLE "access_logs" ADD COLUMN "region_name" text;--> statement-breakpoint
ALTER TABLE "access_logs" ADD COLUMN "zip" text;--> statement-breakpoint
ALTER TABLE "access_logs" ADD COLUMN "lat" text;--> statement-breakpoint
ALTER TABLE "access_logs" ADD COLUMN "lon" text;--> statement-breakpoint
ALTER TABLE "access_logs" ADD COLUMN "timezone" text;--> statement-breakpoint
ALTER TABLE "access_logs" ADD COLUMN "org" text;--> statement-breakpoint
ALTER TABLE "access_logs" ADD COLUMN "asn" text;--> statement-breakpoint
ALTER TABLE "access_logs" DROP COLUMN "fingerprint_id";--> statement-breakpoint
ALTER TABLE "access_logs" DROP COLUMN "status_code";--> statement-breakpoint
ALTER TABLE "access_logs" DROP COLUMN "is_tor";--> statement-breakpoint
ALTER TABLE "access_logs" DROP COLUMN "is_vpn";--> statement-breakpoint
ALTER TABLE "access_logs" DROP COLUMN "is_proxy";--> statement-breakpoint
ALTER TABLE "access_logs" DROP COLUMN "is_datacenter";