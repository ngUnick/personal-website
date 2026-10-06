CREATE TYPE "public"."technology_publication_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "technologies" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"status" "technology_publication_status" DEFAULT 'draft' NOT NULL,
	"display_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "technologies_display_order_non_negative" CHECK ("technologies"."display_order" >= 0)
);
