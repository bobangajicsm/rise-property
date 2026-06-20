# Rise Property: SEO, Functionality, and Idea Roadmap

This document captures the next practical improvements for SEO, product polish, lead generation, and admin workflows.

## 1. SEO: High Priority

### Technical SEO

- Add stricter canonical logic for filtered pages with query params on `/buy`, `/rent`, and `/search`.
- Decide which filtered combinations should be indexable and which should be `noindex`.
- Add a dedicated `robots.txt` strategy for search/filter duplicates and admin routes.
- Add `BreadcrumbList` schema to:
  - listing pages
  - property detail pages
  - SEO search landing pages
- Add `Organization`, `RealEstateAgent`, and stronger `WebSite` structured data globally.
- Add image sitemap support for key property images.
- Add dynamic Open Graph/Twitter images for:
  - property detail pages
  - area/search landing pages

### Content SEO

- Expand `/search/[slug]` pages with real intro copy, FAQ, and internal links.
- Add unique descriptive text blocks for:
  - The Pearl
  - Lusail
  - West Bay
  - West Bay Lagoon
  - Msheireb
  - Al Dafna
- Add supporting area pages if needed later, for example `/areas/the-pearl`.
- Add FAQ schema to high-intent pages like:
  - properties for rent in qatar
  - properties for sale in qatar
  - apartments for sale in lusail

### Internal Linking

- Add stronger internal linking between:
  - homepage sections
  - SEO landing pages
  - property detail pages
  - related areas
- Add related search links below listing results and below property detail.
- Add “Nearby Areas” and “Popular Alternatives” blocks on detail pages.

## 2. SEO: Launch Checklist

- Connect site to Google Search Console.
- Connect Bing Webmaster Tools.
- Submit sitemap after launch.
- Check indexing coverage and duplicate pages.
- Check Core Web Vitals on mobile.
- Add actual business NAP consistency everywhere:
  - company name
  - address
  - phone
  - email
- Replace all placeholder legal/company details before go-live.

## 3. Performance and UX Improvements

- Replace important homepage/detail/listing `<img>` tags with `next/image` where it makes sense.
- Optimize hero background image size and provide responsive versions.
- Add blur placeholders for large property images.
- Lazy-load below-the-fold sections more aggressively if needed.
- Add better empty states for:
  - no listing results
  - no nearby properties
  - no suggested properties
- Add better loading skeletons for homepage sections too, not only listing/detail routes.

## 4. Listing and Search Improvements

- Add property type to URL filters consistently everywhere.
- Add bathroom filter to search.
- Add furnished filter to public listing pages.
- Add badge/status filters like:
  - featured
  - premium
  - luxury
  - exclusive
- Add “sort by newest” once real `created_at` exists in Neon.
- Add “saved search” sharing presets from current query state.
- Add better no-results recovery suggestions:
  - clear filters
  - nearby areas
  - lower price range

## 5. Property Detail Page Ideas

- Add proper image gallery counter and thumbnail rail.
- Add downloadable brochure section.
- Add mortgage/investment calculator later if relevant.
- Add “request video tour” lead form.
- Add “similar listings by same area and same budget” logic.
- Add amenity icons mapping for common features.
- Add agent card trust signals:
  - response time
  - languages spoken
  - specialty areas

## 6. Admin Improvements

### Property Admin

- Add drag-and-drop image reordering.
- Add image cover selection explicitly.
- Add listing status controls:
  - available
  - reserved
  - sold
  - off market
- Add preview mode before publish.
- Add slug override field if needed.
- Add validation summary that scrolls to the first invalid field.

### Location Admin

- Add image upload for locations instead of URL-only fields.
- Add drag-and-drop order for prime locations.
- Add custom subtitle/description per homepage location card.
- Add optional per-location CTA link target.

### Content/Admin Config

- Add site settings page for:
  - WhatsApp number
  - office address
  - legal email
  - social links
  - homepage hero copy
- Add reusable SEO fields in admin for custom title/meta/OG.

## 7. Lead Generation and CRM

- Finalize Zoho CRM webform/live API fields mapping.
- Log lead source consistently:
  - homepage contact
  - property detail inquiry
  - booking modal
  - WhatsApp click
- Add consent logging tied to lead submissions.
- Add admin leads page with:
  - source
  - inquiry type
  - property
  - date
  - export
- Add webhook/email fallback when Zoho is unavailable.

## 8. Analytics and Tracking

- Add GA4 or Plausible.
- Track key conversions:
  - contact submit
  - viewing request
  - WhatsApp click
  - phone click
  - email click
  - search start
  - property detail view
- Tie analytics to GDPR consent choices.
- Add UTM preservation into lead submissions.

## 9. Content Ideas

- “Best Areas to Live in Qatar” guide.
- “Buying vs Renting in Qatar” guide.
- “Top investment areas in Lusail” article.
- “Luxury waterfront living in The Pearl” article.
- “Office leasing in West Bay” article.
- Area comparison pages:
  - The Pearl vs Lusail
  - West Bay vs West Bay Lagoon

## 10. Future Product Ideas

- Saved favorites with user accounts.
- Compare properties feature.
- Recently viewed properties.
- Shareable shortlists for clients.
- Agent login with scoped permissions.
- Multi-agent dashboard.
- Arabic version later if business needs it again.
- Multi-currency support with real exchange logic.
- Polygon-based custom area pages on the map.

## 11. Recommended Order of Work

### Phase 1

- Fix canonical/noindex strategy.
- Add stronger structured data.
- Expand SEO landing page content.
- Replace high-impact images with optimized image handling.
- Finalize Zoho lead tracking and consent logging.

### Phase 2

- Add admin status fields and richer property publishing workflow.
- Add location image upload and ordering.
- Add analytics and conversion tracking.
- Improve related searches and internal linking.

### Phase 3

- Build leads dashboard.
- Add saved searches/favorites.
- Add deeper area pages and editorial content.

## 12. Notes

- The current project already has a strong base:
  - real route structure
  - SEO search landing pages
  - sitemap
  - legal pages
  - admin with Neon-backed listings and locations
  - Zoho-ready lead flow
- The biggest win now is not “more pages”, but:
  - better index control
  - richer SEO content
  - better structured data
  - faster media
  - stronger lead attribution
