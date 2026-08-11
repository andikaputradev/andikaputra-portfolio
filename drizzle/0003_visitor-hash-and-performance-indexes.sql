ALTER TABLE "page_views" ADD COLUMN "visitor_hash" text;--> statement-breakpoint
CREATE INDEX "certifications_published_display_order_idx" ON "certifications" USING btree ("published","display_order" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "projects_published_display_order_idx" ON "projects" USING btree ("published","display_order" DESC NULLS LAST);