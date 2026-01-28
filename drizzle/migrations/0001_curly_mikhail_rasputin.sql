ALTER TABLE "access_logs" DROP CONSTRAINT "access_logs_username_visitors_username_fk";
--> statement-breakpoint
ALTER TABLE "access_logs" DROP CONSTRAINT "access_logs_node_id_nodes_id_fk";
--> statement-breakpoint
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_admin_username_admins_username_fk";
--> statement-breakpoint
ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_username_visitors_username_fk" FOREIGN KEY ("username") REFERENCES "public"."visitors"("username") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_node_id_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_username_admins_username_fk" FOREIGN KEY ("admin_username") REFERENCES "public"."admins"("username") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nodes" ADD CONSTRAINT "file_size_check" CHECK ("nodes"."file_size" <= 31457280);