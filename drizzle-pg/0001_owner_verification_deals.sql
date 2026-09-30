DO $$ BEGIN CREATE TYPE "ownerType_individual_company_agent_developer_representative_enum" AS ENUM ('individual','company','agent','developer','representative'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "ownerApplicationStatus_draft_submitted_under_review_needs_information_approved_published_suspended_rejected_expired_disputed_enum" AS ENUM ('draft','submitted','under_review','needs_information','approved','published','suspended','rejected','expired','disputed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "verificationCheckType_contact_email_contact_phone_cac_business_lasrera_practitioner_property_authority_identity_manual_review_enum" AS ENUM ('contact_email','contact_phone','cac_business','lasrera_practitioner','property_authority','identity','manual_review'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "verificationCheckStatus_pending_verified_failed_expired_enum" AS ENUM ('pending','verified','failed','expired'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "dealStatus_new_qualified_owner_contacted_client_contacted_viewing_scheduled_offer_negotiation_won_lost_on_hold_enum" AS ENUM ('new','qualified','owner_contacted','client_contacted','viewing_scheduled','offer','negotiation','won','lost','on_hold'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ownerProfiles" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer,
  "ownerType" "ownerType_individual_company_agent_developer_representative_enum" NOT NULL,
  "legalName" varchar(180) NOT NULL,
  "displayName" varchar(180) NOT NULL,
  "companyName" varchar(180),
  "cacNumber" varchar(80),
  "lasreraNumber" varchar(80),
  "state" varchar(80),
  "city" varchar(100),
  "email" varchar(320) NOT NULL,
  "phone" varchar(60),
  "status" "ownerApplicationStatus_draft_submitted_under_review_needs_information_approved_published_suspended_rejected_expired_disputed_enum" DEFAULT 'draft' NOT NULL,
  "publicEmailAllowed" integer DEFAULT 0 NOT NULL,
  "publicPhoneAllowed" integer DEFAULT 0 NOT NULL,
  "marketingOptIn" integer DEFAULT 0 NOT NULL,
  "privacyNoticeVersion" varchar(40),
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ownerProperties" (
  "id" serial PRIMARY KEY NOT NULL,
  "ownerProfileId" integer NOT NULL,
  "propertyId" integer NOT NULL,
  "relationshipType" varchar(60) NOT NULL,
  "authorityStatus" varchar(40) DEFAULT 'pending' NOT NULL,
  "isPrimaryContact" integer DEFAULT 1 NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ownerConsents" (
  "id" serial PRIMARY KEY NOT NULL,
  "ownerProfileId" integer NOT NULL,
  "purpose" varchar(80) NOT NULL,
  "fieldsAllowed" text NOT NULL,
  "lawfulBasis" varchar(60) NOT NULL,
  "privacyNoticeVersion" varchar(40) NOT NULL,
  "grantedAt" timestamp DEFAULT now() NOT NULL,
  "withdrawnAt" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verificationChecks" (
  "id" serial PRIMARY KEY NOT NULL,
  "ownerProfileId" integer NOT NULL,
  "propertyId" integer,
  "checkType" "verificationCheckType_contact_email_contact_phone_cac_business_lasrera_practitioner_property_authority_identity_manual_review_enum" NOT NULL,
  "provider" varchar(80) NOT NULL,
  "status" "verificationCheckStatus_pending_verified_failed_expired_enum" DEFAULT 'pending' NOT NULL,
  "resultSummary" text,
  "providerReference" varchar(180),
  "checkedAt" timestamp,
  "expiresAt" timestamp,
  "reviewerId" integer,
  "reviewerNotes" text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verificationAuditEvents" (
  "id" serial PRIMARY KEY NOT NULL,
  "actorId" integer,
  "action" varchar(80) NOT NULL,
  "entityType" varchar(60) NOT NULL,
  "entityId" integer NOT NULL,
  "fromStatus" varchar(60),
  "toStatus" varchar(60),
  "metadata" text,
  "createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deals" (
  "id" serial PRIMARY KEY NOT NULL,
  "inquiryId" integer NOT NULL,
  "ownerProfileId" integer,
  "propertyId" integer,
  "assignedAdminId" integer,
  "status" "dealStatus_new_qualified_owner_contacted_client_contacted_viewing_scheduled_offer_negotiation_won_lost_on_hold_enum" DEFAULT 'new' NOT NULL,
  "nextActionAt" timestamp,
  "lastContactedAt" timestamp,
  "wonAt" timestamp,
  "lostReason" text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dealActivities" (
  "id" serial PRIMARY KEY NOT NULL,
  "dealId" integer NOT NULL,
  "actorId" integer,
  "activityType" varchar(60) NOT NULL,
  "note" text,
  "contactChannel" varchar(40),
  "nextActionAt" timestamp,
  "occurredAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ownerProfiles_status_idx" ON "ownerProfiles" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ownerProperties_owner_idx" ON "ownerProperties" USING btree ("ownerProfileId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ownerProperties_property_idx" ON "ownerProperties" USING btree ("propertyId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verificationChecks_status_idx" ON "verificationChecks" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verificationChecks_owner_idx" ON "verificationChecks" USING btree ("ownerProfileId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verificationChecks_expiry_idx" ON "verificationChecks" USING btree ("expiresAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "deals_status_idx" ON "deals" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "deals_property_idx" ON "deals" USING btree ("propertyId");
