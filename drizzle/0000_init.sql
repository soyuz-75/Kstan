CREATE TYPE "public"."booking_source" AS ENUM('website', 'phone', 'walk_in', 'admin', 'other');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('wedding', 'birthday', 'corporate', 'christening', 'other');--> statement-breakpoint
CREATE TYPE "public"."site_locale" AS ENUM('uk', 'en');--> statement-breakpoint
CREATE TYPE "public"."table_area" AS ENUM('any', 'hall', 'gazebo', 'house', 'terrace');--> statement-breakpoint
CREATE TABLE "event_inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"ref" varchar(16) NOT NULL,
	"event_type" "event_type" NOT NULL,
	"date" date NOT NULL,
	"guests" integer NOT NULL,
	"venue" varchar(60),
	"budget" varchar(120),
	"name" varchar(120) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(254),
	"comment" text,
	"locale" "site_locale" DEFAULT 'uk' NOT NULL,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"source" "booking_source" DEFAULT 'website' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_inquiries_ref_unique" UNIQUE("ref")
);
--> statement-breakpoint
CREATE TABLE "hotel_bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"ref" varchar(16) NOT NULL,
	"room_type_id" integer NOT NULL,
	"check_in" date NOT NULL,
	"check_out" date NOT NULL,
	"adults" integer NOT NULL,
	"children" integer DEFAULT 0 NOT NULL,
	"name" varchar(120) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(254),
	"comment" text,
	"locale" "site_locale" DEFAULT 'uk' NOT NULL,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"source" "booking_source" DEFAULT 'website' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hotel_bookings_ref_unique" UNIQUE("ref"),
	CONSTRAINT "hotel_bookings_dates_chk" CHECK ("hotel_bookings"."check_out" > "hotel_bookings"."check_in"),
	CONSTRAINT "hotel_bookings_adults_chk" CHECK ("hotel_bookings"."adults" >= 1)
);
--> statement-breakpoint
CREATE TABLE "room_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name_uk" varchar(160) NOT NULL,
	"name_en" varchar(160) NOT NULL,
	"capacity" integer NOT NULL,
	"units_count" integer NOT NULL,
	"base_price" integer NOT NULL,
	"amenities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "room_types_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "table_reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"ref" varchar(16) NOT NULL,
	"date" date NOT NULL,
	"time" time NOT NULL,
	"party_size" integer NOT NULL,
	"area" "table_area" DEFAULT 'any' NOT NULL,
	"name" varchar(120) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(254),
	"comment" text,
	"locale" "site_locale" DEFAULT 'uk' NOT NULL,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"source" "booking_source" DEFAULT 'website' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "table_reservations_ref_unique" UNIQUE("ref")
);
--> statement-breakpoint
ALTER TABLE "hotel_bookings" ADD CONSTRAINT "hotel_bookings_room_type_id_room_types_id_fk" FOREIGN KEY ("room_type_id") REFERENCES "public"."room_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_inquiries_date_idx" ON "event_inquiries" USING btree ("date");--> statement-breakpoint
CREATE INDEX "event_inquiries_status_idx" ON "event_inquiries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "hotel_bookings_room_dates_idx" ON "hotel_bookings" USING btree ("room_type_id","check_in","check_out");--> statement-breakpoint
CREATE INDEX "hotel_bookings_status_idx" ON "hotel_bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "table_reservations_date_idx" ON "table_reservations" USING btree ("date");--> statement-breakpoint
CREATE INDEX "table_reservations_status_idx" ON "table_reservations" USING btree ("status");