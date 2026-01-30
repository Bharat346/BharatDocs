ALTER TABLE "nodes" DROP CONSTRAINT "file_size_check";
ALTER TABLE "nodes" ADD CONSTRAINT "file_size_check" CHECK ("nodes"."file_size" IS NULL OR "nodes"."file_size" <= 31457280);