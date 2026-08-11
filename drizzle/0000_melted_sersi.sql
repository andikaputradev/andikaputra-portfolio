CREATE TYPE "public"."audit_action" AS ENUM('create', 'update', 'delete');--> statement-breakpoint
CREATE TYPE "public"."audit_entity_type" AS ENUM('project', 'certification', 'profile');--> statement-breakpoint
CREATE TYPE "public"."project_tag" AS ENUM('SECURITY', 'WEB2', 'WEB3');--> statement-breakpoint
CREATE TYPE "public"."schema_type" AS ENUM('CreativeWork', 'SoftwareApplication');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"actor_email" text NOT NULL,
	"action" "audit_action" NOT NULL,
	"entity_type" "audit_entity_type" NOT NULL,
	"entity_id" text,
	"ip_address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certifications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "certifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"issuer" text NOT NULL,
	"issue_date" timestamp with time zone NOT NULL,
	"expiry_date" timestamp with time zone,
	"credential_id" text,
	"verification_url" text,
	"badge_image_public_id" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "projects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"tag" "project_tag" NOT NULL,
	"schema_type" "schema_type" DEFAULT 'CreativeWork' NOT NULL,
	"flagship" boolean DEFAULT false NOT NULL,
	"summary" text NOT NULL,
	"body_markdown" text NOT NULL,
	"stack" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"live_url" text,
	"repo_url" text,
	"cover_image_path" text,
	"cover_image_public_id" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "site_profile" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "site_profile_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"photo_public_id" text,
	"cv_public_id" text,
	"cv_updated_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
