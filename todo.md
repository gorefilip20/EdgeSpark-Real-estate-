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

## Public navigation, favorites, and repository sync

- [x] Remove Admin from the public desktop and mobile navigation menus.
- [x] Add a database-backed favorites/shortlist model tied to signed-in users and properties.
- [x] Add save/remove favorite actions on property cards and detail pages.
- [x] Add a signed-in shortlist page with empty, loading, and saved-property states.
- [x] Verify public user sign-up/sign-in session recording and admin-only access behavior.
- [x] Confirm the user details visible in the admin workspace and lead records; anonymous leads remain supported while signed-in submissions persist user linkage.
- [x] Run tests and visual verification for navigation, favorites, and auth states.
- [x] Push the completed project to the selected GitHub repository.

## Shortlist comparison and repository quality

- [x] Add side-by-side comparison selection from the signed-in shortlist.
- [x] Add comparison metrics for price, location, type, size, ROI, yield, status, and contact actions.
- [x] Add responsive comparison behavior for mobile users.
- [x] Verify the full-stack codebase with type checks, unit tests, and visual checks.
- [x] Confirm the complete codebase is pushed to the selected GitHub repository and branch.

## Responsive release requirement

- [x] Verify every public, account, shortlist, property-detail, WhatsApp, and protected-admin flow at mobile and desktop breakpoints.
- [x] Ensure comparison tables scroll or reflow cleanly on narrow screens without clipping or horizontal page overflow.

## Shortlist notes and tags

- [x] Add private notes and custom tags to each signed-in user-property favorite record.
- [x] Add protected procedures to read and update notes/tags for the owning user only.
- [x] Add note/tag editing controls to the shortlist cards and comparison view.
- [x] Add tag chips and note previews with responsive mobile behavior.
- [x] Add tests for user ownership, validation, persistence, and UI state handling.
- [x] Verify and checkpoint the notes/tags feature.
- [x] Commit and push the completed notes/tags implementation to the selected GitHub repository branch and confirm its commit SHA.

## Tag-based shortlist filtering

- [x] Extract and normalize unique custom tags across the signed-in user’s saved properties.
- [x] Add responsive tag filter controls with active and clear-filter states.
- [x] Filter shortlist cards and comparison selections by the active tag.
- [x] Add an empty filtered-results state and tests for matching behavior, including shared tag normalization and case-insensitive matching.
- [x] Verify and checkpoint the tag-filtering feature.

## Tag autocomplete and founder confirmation

- [x] Add reusable existing-tag suggestions to the shortlist tag editor with corrected draft-state handling.
- [x] Support selecting a suggestion without losing manually entered tags.
- [x] Keep autocomplete keyboard- and mobile-accessible with arrow-key, Enter, Escape, listbox, and touch support.
- [x] Confirm whether Evarestus and Benjamin appear publicly as founders and document the result: neither name nor founder label appears in the current public client source.
- [x] Test autocomplete behavior and checkpoint the update with utility assertions for suggestions, duplicates, and tag preservation.

## Founder section and private contacts

- [x] Add a founder section near the bottom of the public homepage using the supplied two-card direction.
- [x] Add Evarestus and Benjamin founder profiles with names, roles, and concise credibility-focused descriptions.
- [x] Remove visible phone numbers from founder/contact presentation.
- [x] Add visible Email and LinkedIn action labels without displaying the underlying addresses or URLs.
- [x] Make Email open the user’s email app and LinkedIn open the intended founder profile destinations.
- [x] Verify responsive founder cards and contact-link behavior, then checkpoint the update.

## Founder portraits

- [x] Add the supplied actual portrait images for Evarestus and Benjamin to managed project storage.
- [x] Connect the portrait URLs to the corresponding founder cards with accessible alt text.
- [x] Preserve the Email/LinkedIn-only contact actions and keep phone numbers hidden.
- [x] Verify portrait cropping, contrast, and responsive behavior on desktop and mobile.
- [x] Run tests, push the portrait update to GitHub, and save a checkpoint.

## Founder correction and About Us

- [x] Correct Evarestus’s public name to Evarestus Chinecherem Ugwuokanya everywhere it appears.
- [x] Add a dedicated About Us route and public navigation entry.
- [x] Write EdgeSpark mission, operating principles, and investor/partner value proposition content.
- [x] Expand the About Us founder backgrounds for Evarestus and Benjamin using the approved identities and existing portraits.
- [x] Verify About Us and founder presentation on desktop and mobile.
- [x] Run tests, push the update to GitHub, and save a checkpoint.

## Search submit and partnership lead visibility

- [x] Add an explicit Search button beneath the property filters and submit criteria together.
- [x] Ensure search button behavior works on mobile and desktop without losing filters.
- [x] Verify partnership form validation and successful persistence of name, email, phone, company, investment range, role, and message.
- [x] Verify the protected admin workspace displays partnership applications and their full recorded details.
- [x] Add or update tests for search submission and partnership lead persistence/visibility.
- [x] Verify responsive states, push the update to GitHub, and save a checkpoint.

## Search result and WhatsApp correction

- [x] Fix listings search so submitted state, property type, availability, price, and keyword filters return matching available properties.
- [x] Add Nigerian state, local government area, and street discovery guidance/options for property location searches.
- [x] Ensure empty or unmatched search states explain how to broaden the location query.
- [x] Route developer WhatsApp actions to +234 814 199 7159 using an HTML WhatsApp link with a prefilled inquiry message.
- [x] Add focused tests for location filtering and WhatsApp URL generation.
- [x] Verify mobile and desktop search/contact flows and save a final checkpoint.

## Rent/buy filters and listing sharing

- [x] Add a rent/buy transaction dropdown next to the property search.
- [x] Add minimum and maximum price filters that submit with the search criteria.
- [x] Apply transaction and price-range filters to database and fallback property results.
- [x] Add a Share on WhatsApp action to every property card with the listing title, location, and URL.
- [x] Add focused tests for transaction/price filtering and listing share URL generation.
- [x] Verify mobile and desktop property discovery and save a final checkpoint.

## Share confirmation toast

- [x] Show a lightweight visual confirmation toast after a property Share on WhatsApp click.
- [x] Preserve the listing-specific WhatsApp share URL and avoid nested-link navigation.
- [x] Verify the toast/share interaction on mobile and desktop, run tests, and save a checkpoint.

## Share fallback and property-detail sharing

- [x] Add a shared WhatsApp-or-clipboard share helper with a safe clipboard fallback.
- [x] Show a Copied confirmation toast when WhatsApp cannot be opened or clipboard sharing is used.
- [x] Add Share on WhatsApp and visual confirmation toasts to individual property detail pages.
- [x] Add focused tests for fallback outcomes and detail-page share URL generation.
- [x] Verify card and detail sharing on mobile and desktop, run tests, and save a checkpoint.

## Visible copy-link controls

- [x] Add a visible Copy link button beside WhatsApp share on every property card.
- [x] Add a visible Copy link button beside WhatsApp share on individual property detail pages.
- [x] Reuse clipboard confirmation and show a clear Copied toast.
- [x] Verify mobile and desktop sharing layouts, run tests, and save a checkpoint.

## Editable pricing, galleries, and daily showcase

- [x] Make guide price editable in the protected admin property create/edit workflow.
- [x] Verify price updates persist and render consistently on cards, detail pages, search results, and calculators.
- [x] Expand seeded/demo listings with approximately four additional managed property images across houses and land.
- [x] Add a richer multi-image gallery with thumbnail or alternate-image viewing on property cards/detail pages where appropriate.
- [x] Add a daily rotating public showcase that changes the featured house and land imagery deterministically by date.
- [x] Investigate and resolve the two visible mobile errors from the supplied preview.
- [x] Add focused tests for editable price persistence, gallery selection, and daily rotation.
- [x] Verify mobile and desktop admin/public flows and save a final checkpoint.

## Full admin editor, scheduled gallery approval, and media management

- [x] Add full admin property editing for title, location, status, type, description, transaction type, price, and publishing flags.
- [x] Add media delete, reorder, and hero-image selection mutations and controls.
- [x] Add a gallery-set approval model and protected admin controls for draft, approved, and rejected sets.
- [x] Add a Heartbeat-compatible scheduled daily gallery endpoint and admin schedule controls without in-process timers.
- [x] Verify scheduled callbacks are cron-authenticated, idempotent, and safe for unpublished content.
- [x] Add focused tests for property update contracts, media ordering/hero behavior, and gallery approval transitions.
- [x] Verify public/admin separation and responsive admin flows, then save a final checkpoint.

## Drag-and-drop media ordering and GitHub sync

- [x] Add accessible drag-and-drop reordering for property media in the protected admin panel.
- [x] Preserve keyboard/button fallback and save the reordered media IDs through the existing mutation.
- [x] Add focused tests for deterministic reorder payload construction and persistence contract.
- [x] Verify admin media ordering on mobile and desktop, run checks, push to the requested GitHub branch, and save a checkpoint.
