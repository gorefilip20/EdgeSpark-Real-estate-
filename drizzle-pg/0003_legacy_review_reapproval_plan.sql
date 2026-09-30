-- MANUAL RELEASE GATE: do not execute automatically from application startup.
-- Review the result, export affected IDs, and obtain owner approval before running.
BEGIN;
SELECT id, slug, title, published, reviewState, approvedBy, approvedAt, lastReviewedAt
FROM "properties"
WHERE published = 1 AND (reviewState <> 'approved' OR approvedBy IS NULL OR lastReviewedAt IS NULL)
ORDER BY id;
-- After the review report is signed off, explicitly gate all legacy rows:
-- UPDATE "properties" SET "published" = 0, "reviewState" = 'needs_review', "lastReviewedAt" = NULL, "approvedBy" = NULL, "approvedAt" = NULL
-- WHERE "published" = 1 AND ("approvedBy" IS NULL OR "lastReviewedAt" IS NULL);
COMMIT;
