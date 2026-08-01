CREATE TABLE "rca_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"log_id" text NOT NULL,
	"log_message" text NOT NULL,
	"log_labels" jsonb NOT NULL,
	"log_timestamp" timestamp with time zone NOT NULL,
	"model_used" text NOT NULL,
	"root_cause" text NOT NULL,
	"impact" text NOT NULL,
	"recommendation" text NOT NULL,
	"raw_response" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
