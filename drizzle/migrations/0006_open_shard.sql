CREATE TABLE "fingerprints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fingerprint" text NOT NULL,
	"username" text,
	"ip_address" text,
	"user_agent" text,
	"canvas_hash" text,
	"webgl_hash" text,
	"fonts_hash" text,
	"screen_hash" text,
	"is_suspicious" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_seen" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "fingerprints_fingerprint_unique" UNIQUE("fingerprint")
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"type" text NOT NULL,
	"endpoint" text,
	"count" integer DEFAULT 0 NOT NULL,
	"window_start" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp DEFAULT now() NOT NULL,
	"is_blocked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "access_logs" ADD COLUMN "fingerprint_id" uuid;--> statement-breakpoint
ALTER TABLE "access_logs" ADD COLUMN "ip_address" text;--> statement-breakpoint
ALTER TABLE "access_logs" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "access_logs" ADD COLUMN "path" text NOT NULL;--> statement-breakpoint
ALTER TABLE "access_logs" ADD COLUMN "method" text NOT NULL;--> statement-breakpoint
ALTER TABLE "access_logs" ADD COLUMN "status_code" integer;--> statement-breakpoint
ALTER TABLE "access_logs" ADD COLUMN "response_time" integer;--> statement-breakpoint
ALTER TABLE "access_logs" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "access_logs" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "access_logs" ADD COLUMN "isp" text;--> statement-breakpoint
ALTER TABLE "access_logs" ADD COLUMN "is_tor" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "access_logs" ADD COLUMN "is_vpn" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "access_logs" ADD COLUMN "is_proxy" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "access_logs" ADD COLUMN "is_datacenter" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "fingerprints" ADD CONSTRAINT "fingerprints_username_visitors_username_fk" FOREIGN KEY ("username") REFERENCES "public"."visitors"("username") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_fingerprint_id_fingerprints_id_fk" FOREIGN KEY ("fingerprint_id") REFERENCES "public"."fingerprints"("id") ON DELETE no action ON UPDATE no action;