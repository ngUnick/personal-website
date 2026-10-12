CREATE TABLE "experience_technologies" (
	"experience_id" uuid NOT NULL,
	"technology_id" uuid NOT NULL,
	CONSTRAINT "experience_technologies_experience_id_technology_id_pk" PRIMARY KEY("experience_id","technology_id")
);
--> statement-breakpoint
ALTER TABLE "experience_technologies" ADD CONSTRAINT "experience_technologies_experience_id_experiences_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience_technologies" ADD CONSTRAINT "experience_technologies_technology_id_technologies_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;