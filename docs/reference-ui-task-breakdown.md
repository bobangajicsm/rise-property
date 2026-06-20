# Rise Property Reference UI Task Breakdown

## Purpose

This document translates the current PDF recommendations and the provided reference screenshots into an implementation-ready task list.

Primary goal:

- match the reference flow as closely as possible on mobile
- improve the desktop listing experience without breaking existing listing data
- extend the current data model only in additive, migration-safe ways

## Source Inputs

- `Rise_Property_Combined_Recommendations_1.pdf`
- `Screen Shot 2026-04-25 at 17.43.41 PM.png`
- `Screen Shot 2026-04-25 at 17.43.47 PM.png`

## Current Foundation In This Repo

Already present:

- searchable listing page with filters in [components/listing/property-listing-page.tsx](/Users/vaskrsijepanic/Desktop/Projects/rise-property/components/listing/property-listing-page.tsx)
- interactive map with drawn-area filtering in [components/maps/property-listing-map.tsx](/Users/vaskrsijepanic/Desktop/Projects/rise-property/components/maps/property-listing-map.tsx)
- property storage backed by Neon/Postgres with additive schema setup in [lib/properties-store.ts](/Users/vaskrsijepanic/Desktop/Projects/rise-property/lib/properties-store.ts)
- dynamic property types in [lib/property-types-store.ts](/Users/vaskrsijepanic/Desktop/Projects/rise-property/lib/property-types-store.ts)
- featured area storage in [lib/featured-areas-store.ts](/Users/vaskrsijepanic/Desktop/Projects/rise-property/lib/featured-areas-store.ts)

Partially ready, but not yet matching the reference:

- mobile map view exists, but not in the exact card-stack style shown in the screenshots
- filter UI exists, but not as the full-screen mobile filter sheet with histogram and stepper/toggle layout
- homepage exists, but the mobile hero/search/filter/map composition is different from the reference
- agent system exists only as a static file in [data/agents.ts](/Users/vaskrsijepanic/Desktop/Projects/rise-property/data/agents.ts)
- contacts go to Zoho, but there is no admin inbox/contacts area yet

## Delivery Principle

Implementation must preserve existing database records and current admin-entered listings.

Rules:

- use additive schema changes only in the first pass
- prefer `ADD COLUMN IF NOT EXISTS` or new supporting tables
- do not drop, rename, or overwrite existing property fields unless a safe backfill path is fully verified
- keep current `properties.id`, `slug`, listing type, usage, and existing images intact
- where new UI needs extra data, first try to map it from existing fields before introducing new columns

## Scope A: Desktop Listing Page Fixes

Derived from PDF Part 1.

### A1. Property detail flow cleanup

- move listing details directly below the main image/gallery area
- reduce or remove the current video-first interruption in the listing reading flow
- ensure the first visible content after imagery is price, title, location, and key specs

### A2. Filter bar downsizing and scroll behavior

- reduce filter bar visual weight
- make the filter area feel lighter on first paint
- implement shrink/collapse behavior on scroll instead of a bulky frozen block
- verify sticky header plus filter interaction does not trap scrolling

### A3. Sticky map behavior

- keep the right-side map sticky while the listing column scrolls
- ensure map height and sticky offsets behave correctly on large desktop breakpoints
- validate that header/filter transitions do not break map sizing

### A4. Selected pin emphasis

- improve active marker visibility
- guarantee only one marker is visually highlighted at a time
- make selected state persist clearly when interacting between list and map

### A5. Remove listing image overlays

- remove type label overlay on listing cards where not needed
- remove `ID` image overlay
- remove `Luxury` image overlay from thumbnails/cards
- keep metadata in the text content area instead of on top of the photos

### A6. Faster image experience

- optimize listing card image loading strategy
- preload or prioritize first-visible card images
- make image switching feel instant in gallery interactions

### A7. Thumbnail strip below main photo

- add horizontal thumbnail strip directly below the main property image
- allow tap/click thumbnail switching
- support swipe behavior on mobile if the detail page uses the same gallery pattern

### A8. Map interaction glitch investigation

- reproduce map click/selection glitch on the listing page
- verify popup opening, active pin state, and list syncing
- test interaction with draw tools, sticky layout, and mobile map mode
- fix event conflicts without regressing current map filtering

## Scope B: Mobile Homepage Redesign

Derived from PDF Part 2 and the provided screenshot.

### B1. Mobile hero redesign

- redesign mobile homepage hero to match the cleaner reference direction
- headline structure: strong bold title with the same reading rhythm as the reference
- place AI search box directly below the headline
- keep the layout compact and conversion-focused

### B2. Mobile quick filters

- add compact `Rent / Buy` toggle
- add compact `Residential / Commercial` toggle
- ensure these states route into the existing search/listing flow cleanly

### B3. Embedded mini map preview on homepage

- add small map preview section on mobile homepage
- show property dots/pins in a simplified view
- include the `Filters` CTA in the same area
- clicking the section should move the user into the map/listing experience

### B4. Featured cards under map

- surface featured listing cards below the map preview
- keep card styling aligned with the mobile reference
- make the cards feel scannable and lightweight

## Scope C: Mobile Map, Result Cards, and Full-Screen Filter Flow

Derived from PDF Part 2 and both screenshots.

### C1. Mobile results map layout

- replicate the map-first mobile layout shown in the screenshot
- floating search field at top
- filter icon/button in the search row
- map pins centered as the main interaction
- horizontally scrollable result cards docked near the bottom

### C2. Result card parity

- card image, small badges, price, short address, and CTA should match the visual pattern closely
- support swipe/drag between cards
- sync active card with active map pin

### C3. Full-screen filter sheet

- open a full-screen filter panel from the map
- top row should include cancel, title, and reset
- add sale/rent tabs
- add home type multi-select chips
- add home details section with bedroom and bathroom counters
- add toggle rows for simple boolean options
- bottom anchored `See results` CTA

### C4. Visual histogram + dual range slider

- add a histogram-style price band visual
- add dual-thumb min/max range control
- connect it to real filtering logic
- support both buy and rent pricing modes

### C5. Map area selection parity

- keep current draw-on-map capability
- adapt it so it feels compatible with the reference flow
- confirm selected shape correctly filters result cards and list results

## Scope D: Data and Model Extensions Needed For This UI

Not everything requires schema work. Current model already covers:

- `listingType`
- `usage`
- `type`
- `price`
- `beds`
- `baths`
- `furnished`
- coordinates
- images

Potential additive extensions only if truly needed:

- property ordering / featured ranking for homepage blocks
- extra listing flags if the new filter design introduces new switches that are real business fields
- homepage configuration table for mobile hero text and ordering rules
- UI/settings tables for dynamic labels and homepage controls

Recommended approach:

- first ship the reference UI using existing fields where possible
- only add new columns/tables where the business value is clear
- put new admin-managed configuration into separate tables instead of bloating `properties`

## Scope E: Broader V2 Tasks From The PDF

Derived from PDF Part 3.

### E1. Dynamic admin controls

- dynamic agent management
- dynamic website settings
- dynamic social links
- homepage property ordering/highlighting

### E2. Search and listing improvements

- improved search relevance
- shorter, cleaner create/edit listing flow
- more dynamic listing field handling
- homepage listing slider
- comparison tool

### E3. Lead and communication systems

- admin contacts/inquiries area
- keep submissions in admin in addition to Zoho
- email notifications for new inquiries
- newsletter collection and template-based sends

### E4. Analytics and automation

- admin analytics dashboard
- Google Analytics
- lead source and engagement visibility
- AI chat assistant

### E5. Platform and security

- Arabic version
- authenticator-based admin 2FA
- stronger admin access security

## Suggested Execution Order

### Phase 1: Reference parity and safe rollout

- desktop listing/map fixes
- mobile homepage redesign
- mobile map/results/filter parity
- QA across breakpoints

### Phase 2: Admin and operational upgrades

- agent management
- homepage controls
- settings/social/admin contacts
- email notifications

### Phase 3: Growth and premium features

- AI assistant
- analytics dashboard
- comparison
- Arabic version
- newsletter tooling
- 2FA

## QA Checklist

- existing properties still render correctly from current database rows
- no listing data loss after schema extension
- buy/rent and residential/commercial routing still works
- search URLs still sync correctly
- map selection works from list to map and map to cards/list
- mobile filter sheet does not block or break page scroll
- homepage mobile layout matches the provided reference closely
- desktop sticky map and shrinking filter behavior works on real viewport sizes

## Estimated File Areas Likely To Be Touched During Implementation

- [components/listing/property-listing-page.tsx](/Users/vaskrsijepanic/Desktop/Projects/rise-property/components/listing/property-listing-page.tsx)
- [components/maps/property-listing-map.tsx](/Users/vaskrsijepanic/Desktop/Projects/rise-property/components/maps/property-listing-map.tsx)
- [components/home/home-page.tsx](/Users/vaskrsijepanic/Desktop/Projects/rise-property/components/home/home-page.tsx)
- homepage hero/mobile sections under `components/home/*`
- [app/page.tsx](/Users/vaskrsijepanic/Desktop/Projects/rise-property/app/page.tsx)
- [app/search/page.tsx](/Users/vaskrsijepanic/Desktop/Projects/rise-property/app/search/page.tsx)
- [lib/properties-store.ts](/Users/vaskrsijepanic/Desktop/Projects/rise-property/lib/properties-store.ts)
- [types/property.ts](/Users/vaskrsijepanic/Desktop/Projects/rise-property/types/property.ts)
- new admin/settings stores if dynamic V2 controls are included

## Final Note

The screenshot-identical mobile work and the desktop listing fixes are very achievable on top of the current codebase because the main foundations already exist.

The full V2 scope is larger and should be treated as a phased product roadmap, not as one single undifferentiated task.
