# Project TODO

- [x] Audit the existing EdgeSpark repository and translate useful product patterns into the new managed app.
- [x] Establish the premium EdgeSpark brand system, including icon/logo, typography, color palette, and visual tokens.
- [x] Build the investor-focused landing page with hero, featured properties, market stats, and conversion CTAs.
- [x] Build the public listings page with search, type/price/location/status filters, grid/list toggle, and pagination.
- [x] Add an interactive Google Map to the listings experience with property markers and neighborhood exploration.
- [x] Build property detail pages with gallery, specifications, pricing, status, and contact actions.
- [x] Add inline mortgage and ROI deal analyzers to property detail pages.
- [x] Add a standalone calculators page with mortgage and ROI tools.
- [x] Build the partnership page for investors, owners, agents, developers, and licensed realtors with role-specific value propositions.
- [x] Add inquiry and partnership application forms with validation and lead persistence.
- [x] Add owner email and push notification delivery for every new inquiry/application.
- [x] Add database schema for properties, property media, inquiries, partnership applications, and lead status history.
- [x] Add S3-backed multi-image property upload and media management for admins.
- [x] Add role-protected admin dashboard at a distinct admin route.
- [x] Add admin property CRUD, listing toggles, status management, and media controls.
- [x] Add admin inquiry and partnership lead management with response/status updates.
- [x] Add role-based access control ensuring public visitors cannot access admin operations.
- [x] Write/update Vitest coverage for public submissions, admin authorization, property operations, and calculator logic.
- [x] Verify desktop and mobile layouts, error/loading/empty states, accessibility, and key interaction flows.
- [x] Save a final checkpoint and deliver the redesigned platform with audit findings and next-step recommendations.

## Audit follow-ups

- [x] Add price-range and location filters plus real pagination to listings.
- [x] Add nearby-amenities and neighborhood exploration interactions to the map.
- [x] Add a real uploaded-media gallery/lightbox to property details.
- [x] Embed the mortgage/ROI analyzer directly on property details.
- [x] Add notification failure handling and a documented email fallback path.
- [x] Add lead status history persistence.
- [x] Add admin media controls for hero selection, reorder, and removal.
- [x] Add admin property edit, delete, and per-row status/toggle actions.
- [x] Add admin UI for lead status changes and response notes.
- [x] Expand Vitest coverage for public lead submission and property operations.
- [x] Verify mobile, accessibility, loading, error, and empty states explicitly.

## Production extension

- [x] Add Nigerian property search across city, state, neighborhood, address, and property title.
- [x] Distinguish land and house/property types in listing data, filters, cards, and admin forms.
- [x] Connect production listing data and real property photography through admin-managed media.
- [x] Add WhatsApp availability/contact actions for each property, agent, and developer conversation.
- [x] Add Google Places nearby amenities and neighborhood exploration from property/listing maps.
- [x] Add lead status history and admin response notes for inquiries and WhatsApp-intent leads.
- [x] Add notification retry/fallback handling for owner alerts and document delivery behavior.
- [x] Add tests for Nigerian search, WhatsApp link generation, lead history, and notification fallback behavior.
- [x] Verify responsive search, WhatsApp conversion, admin media, and amenity flows before the next checkpoint.

## Seed, accounts, and production notifications

- [x] Add a seed workflow for clearly labeled sample Nigerian house and land listings with source/verification metadata. (Demo records are labeled TEST DATA and require verification before publishing.)
- [x] Add high-quality property photography assets to the managed storage workflow and connect them to seeded listings.
- [x] Keep the admin dashboard on a separate protected route with explicit admin-only access behavior.
- [x] Add public user sign-up/create-account and login entry points without exposing admin credentials.
- [x] Defer secure owner email notification configuration until a later notification phase.
- [x] Defer secure owner SMS fallback notification configuration until a later notification phase.
- [x] Keep credentials out of the codebase; admin access remains role-gated through the connected auth provider.
- [x] Test seeded listings, search/display, user account flow, and admin isolation; notification configuration is intentionally deferred.

## Auth and notification integration

- [x] Add a separate public user account page with sign-up and login entry points.
- [x] Add a separate admin login page that routes only to the protected admin workspace.
- [x] Defer Resend email delivery until a later notification phase.
- [x] Defer Termii SMS fallback until a later notification phase.
- [x] Defer notification delivery status and simulation mode with the notification phase.
- [x] Defer simulated notification delivery testing with the notification phase.
- [x] Verify and checkpoint the auth mockups; notification integration is intentionally deferred.

## Scope change — notifications deferred

- [x] Remove Resend/Termii implementation and credential requirements from the active product scope; revisit later when notification work resumes.
- [x] Finish separate admin login and public user account page routing.
- [x] Populate clearly labeled sample Nigerian houses and land listings for testing.
- [x] Add photography-ready seeded media and verify property display/search behavior.
- [x] Verify admin isolation and public account entry flows.
