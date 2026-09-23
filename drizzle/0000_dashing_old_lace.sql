CREATE TYPE "public"."expense_category" AS ENUM('alimentacao', 'transporte', 'lazer', 'saude', 'moradia', 'outros');--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"amount_cents" integer NOT NULL,
	"description" text NOT NULL,
	"category" "expense_category" NOT NULL,
	"payment_method" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"raw_message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
