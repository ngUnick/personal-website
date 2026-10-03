CREATE TYPE "public"."experience_publication_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "experiences" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization" text NOT NULL,
	"role" text NOT NULL,
	"summary" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"status" "experience_publication_status" DEFAULT 'draft' NOT NULL,
	"display_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "experiences_display_order_non_negative" CHECK ("experiences"."display_order" >= 0)
);
