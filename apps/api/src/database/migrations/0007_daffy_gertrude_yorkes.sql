CREATE TYPE "public"."credential_publication_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "credentials" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"issuer" text NOT NULL,
	"issued_on" date NOT NULL,
	"status" "credential_publication_status" DEFAULT 'draft' NOT NULL,
	"display_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credentials_display_order_non_negative" CHECK ("credentials"."display_order" >= 0)
);
