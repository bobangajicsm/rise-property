# Rise Property: Ideal Next Improvements

Ovo je praktičan roadmap za naredni pass, nakon trenutnih UX i listing poboljšanja.

## 1. Search Relevance

- Dodati pravi relevance score umjesto običnog `includes` matcha.
- Prioritet dati ovim redom:
  `exact location > area > development/title > reference ID > partial text`
- Kada user unese lokaciju, prva 3 rezultata trebaju biti iz te lokacije prije ostalih fallback rezultata.
- Ako postoji exact match lokacija, fallback rezultati iz ostatka Qatara ne trebaju ići iznad exact rezultata.
- Dodati “Recent searches” i “Popular this week” u hero/search overlay.

## 2. Better Listing Discovery

- Dodati sticky mini summary bar na listing page:
  `Location`, `Buy/Rent`, `Usage`, `Price`, `Bedrooms`
- Dodati “remove one filter” akcije direktno na aktivne chipove.
- Dodati “sort by relevance” kao default kad postoji search query.
- Dodati “Featured first” ili “Best match first” za home-to-listing ulaze.
- Dodati quick paths:
  `Buy in The Pearl`, `Rent in West Bay`, `Commercial in Lusail`

## 3. Commercial / Residential Backend

- `usage` sada treba ostati pravi backend field i ne zavisiti samo od `type`.
- Sljedeći korak je dodati više commercial tipova, npr:
  `Office`, `Retail`, `Warehouse`, `Showroom`, `Land`
- Admin treba dobiti jasnija pravila:
  ako je `usage=commercial`, prikazati samo commercial property type opcije
  ako je `usage=residential`, prikazati samo residential tipove
- Listing SEO stranice i sitemap mogu kasnije dobiti posebne commercial landing stranice.

## 4. Backend Hardening

- Dodati server-side validation schema za property save action, npr. sa `zod`.
- Vratiti jasne field-level greške iz server action layera, ne samo general error.
- Dodati audit log za admin izmjene:
  ko je mijenjao listing, kada, šta je promijenjeno
- Dodati soft delete umjesto permanent delete za listinge.
- Dodati status field:
  `draft`, `published`, `archived`, `off-market`

## 5. Admin Improvements

- Dodati preview mode prije publish.
- Dodati dupliciranje listinga iz admina.
- Dodati cover image reorder drag-and-drop.
- Dodati auto-generated reference preview odmah u editoru.
- Dodati “missing fields” checklist prije publish.

## 6. Lead And CRM Readiness

- Svaki inquiry treba imati source:
  `home hero`, `listing page`, `property detail`, `whatsapp`, `contact form`
- Dodati hidden tracking params:
  `utm_source`, `utm_medium`, `utm_campaign`
- Na property detail stranici spremiti koji listing je generisao lead.
- Ako Zoho ostaje lead-only, svaki lead treba slati i:
  `listing slug`, `listing reference`, `listing type`, `usage`, `area`

## 7. SEO And Landing Pages

- Dodati indexable landing stranice za glavne namjere:
  `Apartments for sale in The Pearl`
  `Villas for rent in West Bay Lagoon`
  `Commercial for rent in Lusail`
- Dodati FAQ schema za search i area stranice.
- Dodati internal linking blokove ispod listinga:
  `Related areas`, `Similar searches`, `Popular in this area`

## 8. Trust And Conversion

- Dodati “Recently added” i “Updated today” signals.
- Dodati bolji empty-state CTA:
  `Request matching properties`
- Dodati shortlist/favorites koji user može poslati sebi ili agentu.
- Dodati sticky inquiry CTA na mobile listing cards.

## 9. Analytics

- Mjeriti:
  search submit
  search suggestion click
  popular location click
  listing card click
  property detail open
  inquiry submit
- Posebno pratiti gdje useri odustaju:
  home search
  listing filters
  property detail

## 10. Highest-Value Next 5 Tasks

Ako bih radio po prioritetu za najbolji odnos effort / rezultat, išao bih ovako:

1. Relevance sorting za search rezultate
2. Server-side validation za property save
3. Status field: `draft/published/archived`
4. Više commercial property type opcija u backendu
5. Empty-state lead capture: `Request matching properties`
