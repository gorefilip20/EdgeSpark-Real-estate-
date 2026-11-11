CREATE TABLE IF NOT EXISTS "internationalProspectOutreach" (
  "id" serial PRIMARY KEY NOT NULL,
  "prospectId" integer NOT NULL,
  "recipientEmail" varchar(320) NOT NULL,
  "subject" varchar(240) NOT NULL,
  "bodyText" text NOT NULL,
  "providerMessageId" varchar(320),
  "status" varchar(32) DEFAULT 'sent' NOT NULL,
  "sentAt" timestamp DEFAULT now() NOT NULL,
  "followUpAt" timestamp,
  "followUpCount" integer DEFAULT 0 NOT NULL,
  "lastError" text,
  "createdBy" integer,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "internationalProspectMessages" (
  "id" serial PRIMARY KEY NOT NULL,
  "prospectId" integer NOT NULL,
  "outreachId" integer,
  "direction" varchar(16) NOT NULL,
  "fromEmail" varchar(320),
  "toEmail" varchar(320),
  "subject" varchar(240),
  "bodyText" text NOT NULL,
  "providerMessageId" varchar(320),
  "aiSummary" text,
  "aiSuggestedReply" text,
  "receivedAt" timestamp DEFAULT now() NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "internationalProspectOutreach_prospect_idx" ON "internationalProspectOutreach" ("prospectId", "sentAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "internationalProspectMessages_prospect_idx" ON "internationalProspectMessages" ("prospectId", "receivedAt");
