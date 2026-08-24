CREATE TYPE "public"."leadType_inquiry_partnership_enum" AS ENUM('inquiry', 'partnership');--> statement-breakpoint
CREATE TYPE "public"."propertyType_apartment_duplex_bungalow_land_commercial_other_enum" AS ENUM('apartment', 'duplex', 'bungalow', 'land', 'commercial', 'other');--> statement-breakpoint
CREATE TYPE "public"."role_investor_owner_agent_developer_realtor_enum" AS ENUM('investor', 'owner', 'agent', 'developer', 'realtor');--> statement-breakpoint
CREATE TYPE "public"."role_user_admin_enum" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."status_draft_available_under_offer_sold_off_market_enum" AS ENUM('draft', 'available', 'under_offer', 'sold', 'off_market');--> statement-breakpoint
CREATE TYPE "public"."status_new_contacted_qualified_closed_enum" AS ENUM('new', 'contacted', 'qualified', 'closed');--> statement-breakpoint
CREATE TYPE "public"."status_new_researching_contacted_meeting_won_archived_enum" AS ENUM('new', 'researching', 'contacted', 'meeting', 'won', 'archived');--> statement-breakpoint
CREATE TYPE "public"."status_new_reviewed_contacted_approved_declined_enum" AS ENUM('new', 'reviewed', 'contacted', 'approved', 'declined');--> statement-breakpoint
CREATE TYPE "public"."verificationStatus_unverified_under_review_verified_enum" AS ENUM('unverified', 'under_review', 'verified');--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"propertyId" integer NOT NULL,
	"notes" text,
	"tags" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"propertyId" integer,
	"userId" integer,
	"name" varchar(160) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(60),
	"message" text NOT NULL,
	"status" "status_new_contacted_qualified_closed_enum" DEFAULT 'new' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "internationalProspectContacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"prospectId" integer NOT NULL,
	"contactName" varchar(180),
	"contactRole" varchar(180),
	"email" varchar(320),
	"phone" varchar(80),
	"website" text,
	"bookingUrl" text,
	"sourceUrl" text,
	"fetchedAt" timestamp DEFAULT now() NOT NULL,
	"meetingAt" timestamp,
	"meetingNotes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "internationalProspectContacts_prospectId_unique" UNIQUE("prospectId")
);
--> statement-breakpoint
CREATE TABLE "internationalProspects" (
	"id" serial PRIMARY KEY NOT NULL,
	"placeId" varchar(180) NOT NULL,
	"region" varchar(32) NOT NULL,
	"countryCode" varchar(2) NOT NULL,
	"status" "status_new_researching_contacted_meeting_won_archived_enum" DEFAULT 'new' NOT NULL,
	"notes" text,
	"pitchAngle" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "internationalProspects_placeId_unique" UNIQUE("placeId")
);
--> statement-breakpoint
CREATE TABLE "leadStatusHistory" (
	"id" serial PRIMARY KEY NOT NULL,
	"leadType" "leadType_inquiry_partnership_enum" NOT NULL,
	"leadId" integer NOT NULL,
	"fromStatus" varchar(40),
	"toStatus" varchar(40) NOT NULL,
	"note" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "localAccounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"passwordHash" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "localAccounts_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "localUsers" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320) NOT NULL,
	"loginMethod" varchar(64) DEFAULT 'email' NOT NULL,
	"role" "role_user_admin_enum" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "localUsers_openId_unique" UNIQUE("openId"),
	CONSTRAINT "localUsers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "partnershipApplications" (
	"id" serial PRIMARY KEY NOT NULL,
	"role" "role_investor_owner_agent_developer_realtor_enum" NOT NULL,
	"userId" integer,
	"name" varchar(160) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(60),
	"company" varchar(180),
	"investmentRange" varchar(120),
	"message" text NOT NULL,
	"status" "status_new_reviewed_contacted_approved_declined_enum" DEFAULT 'new' NOT NULL,
	"adminNotes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(180) NOT NULL,
	"slug" varchar(220) NOT NULL,
	"description" text NOT NULL,
	"status" "status_draft_available_under_offer_sold_off_market_enum" DEFAULT 'draft' NOT NULL,
	"propertyType" "propertyType_apartment_duplex_bungalow_land_commercial_other_enum" DEFAULT 'other' NOT NULL,
	"address" varchar(240) NOT NULL,
	"city" varchar(120) NOT NULL,
	"state" varchar(120) NOT NULL,
	"country" varchar(120) DEFAULT 'Nigeria' NOT NULL,
	"neighborhood" varchar(160),
	"agentName" varchar(160),
	"agentWhatsapp" varchar(40),
	"developerName" varchar(180),
	"developerWhatsapp" varchar(40),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"price" integer NOT NULL,
	"bedrooms" integer,
	"bathrooms" integer,
	"areaSqm" integer,
	"projectedRoi" numeric(5, 2),
	"projectedYield" numeric(5, 2),
	"featured" integer DEFAULT 0 NOT NULL,
	"published" integer DEFAULT 0 NOT NULL,
	"isDemo" integer DEFAULT 0 NOT NULL,
	"sourceLabel" varchar(180),
	"verificationStatus" "verificationStatus_unverified_under_review_verified_enum" DEFAULT 'unverified' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "properties_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "propertyMedia" (
	"id" serial PRIMARY KEY NOT NULL,
	"propertyId" integer NOT NULL,
	"url" text NOT NULL,
	"storageKey" text NOT NULL,
	"fileName" varchar(255),
	"mimeType" varchar(120),
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"isHero" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"passwordHash" text,
	"role" "role_user_admin_enum" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
