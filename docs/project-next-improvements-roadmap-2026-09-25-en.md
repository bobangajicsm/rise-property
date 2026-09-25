# Rise Property - Completed Updates And Suggested Improvements

Date: 2026-09-25

This document summarizes the platform improvements that have already been completed and outlines suggested next steps that can further improve the user experience, admin workflow, and public property browsing.

## Already Completed

### 1. Agent Login Access

Agent login access has been added to the platform.

Each agent can now have their own username and password created from the main admin area. Agents can log in separately from the main admin and access only the listings assigned to them.

Completed items:

- Agent username and password support.
- Separate Agent Login flow.
- Main Admin Login remains separate.
- Agents can access only their assigned listings.
- Agents cannot access full admin-only areas.
- Agents cannot delete listings.
- Agent sessions and admin sessions are separated.

### 2. Multi-Agent Listing Assignment

Listings now support multiple assigned agents instead of being limited to one agent only.

This allows the business to assign several consultants to the same property when needed.

Completed items:

- Multiple agents can be assigned to one listing.
- Agents can be added from the admin listing view.
- Agents can be removed from a listing inside the listing editor.
- A listing cannot be left without at least one assigned agent.
- Assigned agents are shown with compact avatar circles.
- Agent access works with multi-agent listings.

### 3. Admin Listing Page Improvements

The admin listing page has been improved to make daily management easier and cleaner.

Completed items:

- Cleaner listing table layout.
- Better mobile and desktop presentation.
- Listing image preview.
- Title, location, public link, price, and assigned agents are easier to scan.
- Optional table columns were added so the admin can choose what extra information to display.
- Assigned agent avatars are visible directly in the listing table.

### 4. Agent Management Improvements

Agent management has been expanded in the admin panel.

Completed items:

- Create, edit, and manage agent profiles.
- Upload agent avatar.
- Resize and reposition agent avatar image.
- Enable or disable login access for an agent.
- Set or update an agent password.
- Transfer assigned listings when removing an agent.
- Cleaner confirmation dialogs for important actions.

### 5. Login Screen Improvement

The login screen has been redesigned so admin and agent access are clearly separated.

Completed items:

- Admin / Agent login tabs.
- Cleaner login layout.
- Better labels and placeholders.
- Improved visual separation between admin and agent access.
- Clearer error handling.

### 6. Logged-In User Visibility

The admin interface now clearly shows who is logged in.

Completed items:

- Shows whether the user is Admin or Agent.
- Shows agent name and avatar when logged in as an agent.
- Displays user identity in the admin sidebar/header.
- Makes access level clearer while using the admin area.

## Suggested Next Improvements

### 1. Grouped Listing Markers On The Map

When multiple listings are located at the same or very close position, the map should show one grouped marker with a number.

For example, if two properties are in the same building or location, the map can show a marker with `2`. When the visitor clicks it, a popup opens with the list of those listings.

Suggested items:

- Group listings that share the same or nearby location.
- Show a numbered marker for grouped listings.
- Open a popup list when the marker is clicked.
- Show image, title, price, and action for each listing inside the popup.
- Reduce map clutter and improve browsing clarity.

### 2. Homepage Property Swiper

The homepage recommended properties section can be improved with a polished property swiper.

This would make the homepage feel more interactive and premium, especially on mobile.

Suggested items:

- Add left and right navigation arrows.
- Add mobile swipe support.
- Add smooth property browsing.
- Improve recommended property presentation.
- Make better use of homepage space.

### 3. Agent Filter In Admin Listings

The admin listing page can be improved further with a filter by assigned agent.

This would make it easier for the main admin to quickly review listings by consultant.

Suggested items:

- Filter listings by agent.
- Show listings assigned to one specific agent.
- Combine agent filter with existing search and status filters.
- Improve management for larger listing inventories.

### 4. Saved Admin Table Preferences

The admin can currently choose optional columns, but those choices could be saved.

Suggested items:

- Save selected table columns.
- Keep admin preferences after page reload.
- Improve daily workflow consistency.

### 5. Listing Quality Checks

The admin could benefit from a simple quality control area that highlights listings needing attention.

Suggested items:

- Identify listings without images.
- Identify listings without valid map location.
- Identify listings assigned to inactive agents.
- Identify older drafts.
- Highlight incomplete listing content.
- Help the admin fix listings before publishing.

### 6. Dedicated Profile Page

A dedicated profile page could be added for the logged-in user.

Suggested items:

- Admin profile overview.
- Agent profile overview.
- Assigned listing count for agents.
- Basic account and access information.
- Cleaner place for profile-related settings.

### 7. Public Listing Map Popup Polish

The map popup experience can be made more premium.

Suggested items:

- Cleaner popup cards.
- Better image presentation.
- More compact listing details.
- Improved mobile popup behavior.
- Easier click-through to property details.

### 8. Homepage And Listing Visual Polish

Some visual refinements can make the public website feel more premium and consistent.

Suggested items:

- More consistent buttons and cards.
- Smoother mobile spacing.
- Better image loading behavior.
- Cleaner property card hover states.
- More polished property gallery browsing.

### 9. Performance Improvements

The website can be optimized further for image-heavy pages.

Suggested items:

- Improve image optimization.
- Reduce unnecessary layout shifts.
- Optimize listing and property detail media.
- Improve perceived loading speed.

### 10. Smoke Testing For Important Flows

Basic automated checks can help protect the most important platform flows.

Suggested items:

- Admin login check.
- Agent login check.
- Agent restricted listing access check.
- Listing create/edit check.
- Agent assignment check.
- Public property page check.

## Recommended Priority

1. Grouped map markers with popup listing list.
2. Homepage property swiper.
3. Agent filter in admin listings.
4. Saved table column preferences.
5. Listing quality checks.
6. Dedicated profile page.
7. Public map popup polish.
8. Visual and performance polish.
9. Smoke testing for key flows.

## Summary

The core admin and agent-access improvements have already been completed. The platform now supports agent login, restricted agent listing access, multi-agent listing assignments, improved login design, cleaner listing management, and better visibility of the logged-in user.

The next recommended improvements should focus on the public browsing experience, map usability, homepage presentation, admin filtering, and quality control tools.
