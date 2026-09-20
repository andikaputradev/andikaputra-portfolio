CREATE TYPE "public"."article_category" AS ENUM('SECURITY', 'WEB3', 'WEBDEV', 'GENERAL');--> statement-breakpoint
ALTER TYPE "public"."audit_entity_type" ADD VALUE 'article';--> statement-breakpoint
CREATE TABLE "articles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "articles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"category" "article_category" NOT NULL,
	"summary" text NOT NULL,
	"body_markdown" text NOT NULL,
	"cover_image_public_id" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"reading_time_minutes" integer,
	"published" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"meta_title" text,
	"meta_description" text,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX "articles_published_display_order_idx" ON "articles" USING btree ("published","display_order" DESC NULLS LAST);