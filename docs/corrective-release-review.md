# Corrective release review

## Migration chain

Application startup now requires and applies the idempotent PostgreSQL chain `0000`, `0001_owner_verification_deals`, and `0002_international_inventory_pipeline`. The legacy re-approval report in `drizzle-pg/0003_legacy_review_reapproval_plan.sql` is intentionally **manual**: it is not executed by the app and must be reviewed and approved before any production data change.

## Public visibility gate

Public property queries require `published = 1`, `reviewState = approved`, `status = available`, a non-null `approvedBy`, and a non-null `lastReviewedAt`. This hides legacy or unreviewed records even before the manual release gate is run.

## Privacy and outreach

Public property DTOs are allowlisted and omit private owner/contact fields, source URLs, coordinates, WhatsApp numbers, and review actors; the numeric property ID is retained only as the public enquiry/favorites reference. International suppression is durable, only changes through an audited admin procedure, and is checked again immediately before sending.

## SSRF and truthful feeds

Website enrichment requires HTTPS, rejects userinfo/private/reserved destinations, revalidates every redirect, resolves DNS before each request, limits response bytes/content type, and uses a timeout. No provider configured means no external feed is claimed. Demo/test listings and hard-coded city price overrides are not used by public pages.
