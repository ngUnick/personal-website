CREATE TABLE "profiles" (
	"id" integer PRIMARY KEY NOT NULL,
	"headline" text NOT NULL,
	"summary" text NOT NULL,
	"about" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
