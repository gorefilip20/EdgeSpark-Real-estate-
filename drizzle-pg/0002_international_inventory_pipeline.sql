ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "countryCode" varchar(2) NOT NULL DEFAULT 'NG';
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "currencyCode" varchar(3) NOT NULL DEFAULT 'NGN';
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "sourceUrl" text;
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "sourceType" varchar(60) NOT NULL DEFAULT 'owner_submission';
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "sellingConditions" text;
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "buyerCosts" text;
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "availabilityDate" timestamp;
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "contactPermission" integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "reviewState" varchar(40) NOT NULL DEFAULT 'needs_review';
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "submittedBy" integer;
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "approvedBy" integer;
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "approvedAt" timestamp;
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "lastReviewedAt" timestamp;
--> statement-breakpoint
ALTER TABLE "internationalProspects" ADD COLUMN IF NOT EXISTS "category" varchar(120) NOT NULL DEFAULT 'real_estate_partner';
--> statement-breakpoint
ALTER TABLE "internationalProspects" ADD COLUMN IF NOT EXISTS "website" text;
--> statement-breakpoint
ALTER TABLE "internationalProspects" ADD COLUMN IF NOT EXISTS "sourceType" varchar(80) NOT NULL DEFAULT 'public_directory';
--> statement-breakpoint
ALTER TABLE "internationalProspects" ADD COLUMN IF NOT EXISTS "sourceUrl" text;
--> statement-breakpoint
ALTER TABLE "internationalProspects" ADD COLUMN IF NOT EXISTS "collectedAt" timestamp NOT NULL DEFAULT now();
--> statement-breakpoint
ALTER TABLE "internationalProspects" ADD COLUMN IF NOT EXISTS "confidence" varchar(40) NOT NULL DEFAULT 'needs_review';
--> statement-breakpoint
ALTER TABLE "internationalProspects" ADD COLUMN IF NOT EXISTS "ownerId" integer;
--> statement-breakpoint
ALTER TABLE "internationalProspects" ADD COLUMN IF NOT EXISTS "nextStep" text;
--> statement-breakpoint
ALTER TABLE "internationalProspects" ADD COLUMN IF NOT EXISTS "nextStepAt" timestamp;
--> statement-breakpoint
ALTER TABLE "internationalProspects" ADD COLUMN IF NOT EXISTS "doNotContact" integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "internationalProspectContacts" ADD COLUMN IF NOT EXISTS "sourceType" varchar(80) NOT NULL DEFAULT 'public_business_source';
--> statement-breakpoint
ALTER TABLE "internationalProspectContacts" ADD COLUMN IF NOT EXISTS "confidence" varchar(40) NOT NULL DEFAULT 'needs_review';
--> statement-breakpoint
ALTER TABLE "internationalProspectContacts" ADD COLUMN IF NOT EXISTS "doNotContact" integer NOT NULL DEFAULT 0;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "properties_country_idx" ON "properties" ("countryCode");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "properties_review_idx" ON "properties" ("reviewState");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "prospects_country_idx" ON "internationalProspects" ("countryCode");
