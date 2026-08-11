CREATE TYPE "public"."device_type" AS ENUM('desktop', 'mobile', 'tablet');--> statement-breakpoint
CREATE TABLE "page_views" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "page_views_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"path" text NOT NULL,
	"referrer" text,
	"country" text,
	"device_type" "device_type" DEFAULT 'desktop' NOT NULL,
	"visited_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "certifications" RENAME COLUMN "badge_image_public_id" TO "asset_public_id";--> statement-breakpoint
ALTER TABLE "certifications" ADD COLUMN "asset_format" text;--> statement-breakpoint
CREATE INDEX "page_views_visited_at_idx" ON "page_views" USING btree ("visited_at");--> statement-breakpoint
CREATE INDEX "page_views_path_idx" ON "page_views" USING btree ("path");