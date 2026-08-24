# International Prospecting Research

## Recommended source
Use the existing server-side Google Maps Places proxy for admin-only prospect discovery. Text Search can find businesses by a text query and location; Place Details can return address, phone, website, rating, and map URI when requested with an explicit field mask.

## Relevant implementation facts

- Text Search (New) requires a text query and a response field mask.
- Place Details (New) requires a place ID and a response field mask.
- Search results are not guaranteed to be identical for repeated searches and are limited in count.
- Website and phone fields are higher-cost fields than ID/basic address fields, so the feature should search with lightweight fields first and only request contact details when the admin opens a prospect.
- The existing project has a server-side `makeRequest` helper in `server/_core/map.ts` for Google Maps proxy requests; credentials remain server-side.

## Policy constraints to preserve

- Display Google Maps attribution when showing Places content outside a map.
- Do not pre-fetch, cache, or store Google Places content beyond allowed exceptions. Place IDs may be stored indefinitely.
- The database should store only a prospect's place ID, admin notes, status, and outreach metadata. Live name/address/phone/website details should be fetched from Places when viewing a prospect.
- Keep a visible “Google Maps” attribution and a link to the source place/map when rendering live results.
- Public Terms of Use and Privacy Policy should cover use of Google services before production use.

## Source URLs

- https://developers.google.com/maps/documentation/places/web-service/text-search
- https://developers.google.com/maps/documentation/places/web-service/place-details
- https://developers.google.com/maps/documentation/places/web-service/policies
