# Rise Property - Next Improvements Roadmap

Date: 2026-09-25

This document captures recommended follow-up improvements after the recent admin, agent login, listing assignment, and multi-agent listing work. The priority is to keep every future change incremental and safe for the production database.

## Fixed Immediately

- Removed the rough `agent.username` placeholder.
- The agent login form now uses `Enter agent username`.
- The agent editor username field now uses `Enter agent username`.
- The new password field now uses `Create agent password` instead of the shorter `Set password`.

## 1. Map: Grouped Listing Markers With Counts

### Problem

When multiple listings share the same or very close coordinates, map markers can overlap. Users may not clearly see that there are 2, 3, or more listings in the same place.

### Recommendation

Show one marker with a number, such as `2`, when multiple listings share the same or nearby position. Clicking that numbered marker should open a popup with the list of listings.

### Expected Behavior

- Group listings by coordinates or by a small distance threshold.
- If a group has 1 listing, show the standard price marker.
- If a group has 2 or more listings, show a count marker.
- Clicking the count marker opens a popup.
- The popup should show a compact list with:
  - image
  - title
  - price
  - location or area
  - `View Details` button or link

### Relevant Files

- `components/maps/property-listing-map.tsx`
- `components/maps/area-properties-map.tsx`
- `components/maps/leaflet-markers.ts`

### Notes

The project already has `react-leaflet-cluster`, so it can be used for proper clustering behavior. If the desired behavior is only for identical or near-identical coordinates, a custom grouping implementation can also work without adding a new library.

## 2. Homepage Property Swiper

### Problem

The homepage currently has a recommended properties grid on desktop and horizontal scrolling on mobile. It works, but it could feel more polished with clear left/right controls.

### Recommendation

Add a swiper or slider for recommended properties on the homepage:

- left and right arrows
- progress indicator or dots
- drag and swipe support
- polished mobile and desktop layout
- minimal text

### Relevant Files

- `components/home/recommended-properties.tsx`
- optional new component: `components/home/property-swiper.tsx`

### Notes

This can be done without a new dependency by building a native scroll carousel with buttons. If a full slider system is preferred, add the `swiper` package.

## 3. Admin And Agent Profile Polish

### Recommended Additions

- Add a dedicated `/admin/profile` page.
- For the main admin, show email and role.
- For an agent, show avatar, name, role, username, and assigned listing count.
- Add optional `last_login_at` for agents.
- Add optional `password_updated_at` for agents.

### Database Rule

All new database fields should be optional and added through `ADD COLUMN IF NOT EXISTS`.

## 4. Admin Listing UX

### Recommended Additions

- Remove an agent directly from the listing table avatar stack.
- Add undo feedback after adding or removing an agent.
- Add listing filters by agent.
- Save the admin's selected visible table columns.
- Add bulk assign/remove for multiple agents from the listing table.

### Relevant Files

- `components/admin/admin-listings-table.tsx`
- `components/admin/admin-property-editor.tsx`
- `lib/properties-store.ts`
- `app/actions.ts`

## 5. Data Quality

### Items To Validate

- Listings without valid coordinates.
- Listings without images.
- Listings with duplicate slugs or weak titles.
- Listings with suspiciously high or low prices caused by entry mistakes.
- Listings where the primary agent is inactive.

### Recommendation

Add an admin health panel with checks such as:

- `Missing Images`
- `Missing Coordinates`
- `Inactive Agent Assigned`
- `Drafts Older Than 30 Days`

## 6. Performance And Cleanup

### Observed Cleanup Candidates

There are old or duplicate-looking files that should be reviewed:

- `components/admin/admin-dashboard 2.tsx`
- `lib/storage 2.ts`
- `app/privacy-policy/page 2.tsx`
- `app/terms-and-conditions/page 2.tsx`

### Recommendation

Check whether these files are still used. If they are not used, remove them in a separate cleanup step.

### Images

ESLint still warns about multiple `<img>` elements. This is not a breaking issue, but public-facing image-heavy areas should gradually move to `next/image` for better performance:

- listing cards
- login hero
- admin agent avatars
- property detail galleries

## 7. Tests To Add

### Admin

- Admin login works.
- Admin can add an agent to a listing.
- Admin can remove an agent from a listing.
- A listing cannot be left without any agent.
- Agent transfer works when deleting an agent.

### Agent

- Agent login works.
- Agent sees only assigned listings.
- Agent cannot open another agent's listing.
- Agent does not see admin-only navigation.
- Agent cannot delete listings.

### Public

- Search/listing map shows grouped markers.
- Clicking a grouped marker opens a popup list.
- Homepage swiper works on mobile and desktop.

## Priority

1. Map grouped marker with count and popup list.
2. Homepage property swiper.
3. Listing table filter by agent.
4. Admin/profile page.
5. Duplicate file cleanup.
6. `next/image` performance pass.
7. Playwright smoke tests.
