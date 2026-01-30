CREATE TYPE "public"."severity" AS ENUM('info', 'warn', 'critical');--> statement-breakpoint
CREATE TABLE "security_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event" text NOT NULL,
	"severity" "severity" DEFAULT 'warn' NOT NULL,
	"ip_address" text NOT NULL,
	"user_agent" text,
	"path" text,
	"method" text,
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "severity" "severity" DEFAULT 'info' NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "ip_address" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "user_agent" text;