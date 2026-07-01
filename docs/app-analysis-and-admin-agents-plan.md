# App analiza i plan za admin agente

Status: 1 July 2026

## Brzi zaključak

Ovaj projekat je Next.js 16 App Router aplikacija za Rise Property. Public dio sajta je već dobro pokriven: homepage, buy/rent listingi, search, SEO landing stranice, property detail, legal stranice, sitemap/robots i Zoho lead endpoint. Admin dio već ima login, overview, listinge, create/edit listing, property type management i upload slika za property.

Glavni gap za novi workflow je agent sistem. Agenti su trenutno hardkodirani u `data/agents.ts`, a svaki property čuva agent snapshot u `properties.agent` JSONB polju. To radi za izbor između dva postojeća agenta, ali nije pravi admin-managed sistem.

Od sada agente treba voditi kroz admin panel:

- poseban admin modul za agente
- kreiranje, editovanje, deaktiviranje i brisanje agenta
- automatsko seedovanje postojeća dva agenta
- uklanjanje generičkog/mock agenta kao runtime izvora istine
- mogućnost da se uđe u agenta i prebaci jedan, više, filtrirani set ili svi listingi na tog agenta
- upload agent slike uz resize/crop
- agent “mogućnosti” i brze akcije u profilu

## Šta trenutno postoji

### Public app

Rute:

- `/` - homepage, vuče properties i premium areas.
- `/buy` - listing page za sale properties.
- `/rent` - listing page za rent properties.
- `/search` - kombinovani search sa listing type query parametrom.
- `/search/[slug]` - SEO landing stranice iz `data/seo-search-pages.ts`.
- `/properties/[slug]` - property detail page.
- `/sitemap`, `/sitemap.xml`, `robots.ts`, legal stranice i manifest.

Public iskustvo već koristi:

- filtere po cijeni, beds, baths, type, usage, furnished i sort.
- map prikaz i drawn map filters.
- SEO metadata i JSON-LD za home, listings, collections i property detail.
- Zoho lead submit kroz `app/api/zoho/lead/route.ts`.

### Admin app

Aktivne admin rute:

- `/admin/login`
- `/admin`
- `/admin/listings`
- `/admin/listings/new`
- `/admin/listings/[id]`

Admin već podržava:

- cookie-based admin session kroz `lib/admin-auth.ts`
- create/edit/delete listing kroz Server Actions u `app/actions.ts`
- draft/published status
- property type management kroz `property_types` tabelu
- media upload za listing slike kroz `app/api/admin/upload-image/route.ts`
- R2/S3-compatible storage kroz `lib/storage.ts`

Postoji i `components/admin/admin-locations-manager.tsx` sa store/action podrškom za featured areas, ali `/admin/locations` trenutno samo redirecta na `/admin`. To znači da lokacije imaju dio infrastrukture, ali modul nije uključen u admin navigaciju.

### Backend/storage stanje

Korišteni slojevi:

- Neon preko `@neondatabase/serverless` i `DATABASE_URL`.
- R2/S3-compatible storage preko `R2_*` ili `S3_*` env varijabli.
- `properties` tabela se automatski kreira ako postoji DB.
- `property_types` tabela se automatski kreira i synca iz inventory-ja.
- `featured_areas` tabela postoji kroz store, ali UI nije aktiviran.

Ako `DATABASE_URL` nije dostupan ili store pukne, app pada nazad na `MOCK_PROPERTIES` iz `data/properties.ts`.

## Trenutni agent sistem

Fajlovi:

- `data/agents.ts`
- `types/property.ts`
- `lib/properties-store.ts`
- `components/admin/admin-property-editor.tsx`
- `components/detail/property-detail-page.tsx`
- `components/home/property-modal.tsx`
- `components/site/booking-modal.tsx`

Trenutno postoje dva hardkodirana agenta:

- `oussama-sabbagh` - Oussama Sabbagh
- `oumaima-lounissi` - Oumaima Lounissi

Oba trenutno koriste isti phone/email/WhatsApp u kodu:

- phone: `+974 3111 6240`
- email: `maha@rise-property.com`
- WhatsApp: `https://wa.me/97431116240`

Kako radi sada:

- `AdminPropertyEditor` prikazuje select iz `PROPERTY_AGENTS`.
- Listing save pretvara `agentId` u cijeli agent objekat.
- `properties.agent` čuva snapshot agenta kao JSON.
- Public property detail i modali pozivaju `resolvePropertyAgent(property.agent)`.
- Nema agents tabele.
- Nema admin CRUD-a za agente.
- Nema bulk assignmenta.
- Nema image upload/resize za agent profile.

## Problem koji treba riješiti

Trenutni hardcoded model je dobar za demo, ali nije dobar za produkcijski admin panel.

Glavni problemi:

- agent se ne može dodati iz admina
- agent se ne može urediti centralno
- promjena agenta ne ažurira automatski sve listinge ako je samo snapshot u property-ju
- ne može se masovno prebaciti inventory sa jednog agenta na drugog
- nema agent statusa, default agenta, sort ordera, capabilities ili area coverage
- agent image mora biti URL, nema upload/crop/resize workflow
- postoje zaostali dupli fajlovi: `components/admin/admin-dashboard 2.tsx`, `lib/storage 2.ts`, `app/privacy-policy/page 2.tsx`, `app/terms-and-conditions/page 2.tsx`

## Ciljana odluka

Agenti postaju admin-managed entitet.

`data/agents.ts` ne treba više biti runtime source of truth. Može ostati samo kao seed/default lista za migraciju, ili se može zamijeniti novim `data/agent-seeds.ts`.

Postojeća dva agenta treba automatski seedovati u novu agents tabelu ako tabela nema agente:

- Oussama Sabbagh
- Oumaima Lounissi

Generički/mock agent se briše kao aktivni fallback. Fallback i dalje može postojati samo kao zaštita u kodu, ali ne kao stvarni agent koji admin vidi.

## Predloženi data model

Nova tabela: `agents`

Polja:

- `id TEXT PRIMARY KEY`
- `name TEXT NOT NULL`
- `slug TEXT NOT NULL UNIQUE`
- `role TEXT NOT NULL`
- `image_url TEXT NOT NULL`
- `image_key TEXT`
- `phone TEXT NOT NULL`
- `email TEXT NOT NULL`
- `whatsapp TEXT NOT NULL`
- `bio TEXT`
- `languages JSONB NOT NULL DEFAULT '[]'::jsonb`
- `specialties JSONB NOT NULL DEFAULT '[]'::jsonb`
- `areas JSONB NOT NULL DEFAULT '[]'::jsonb`
- `capabilities JSONB NOT NULL DEFAULT '{}'::jsonb`
- `is_active BOOLEAN NOT NULL DEFAULT TRUE`
- `is_default BOOLEAN NOT NULL DEFAULT FALSE`
- `sort_order INTEGER NOT NULL DEFAULT 0`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Predloženi `capabilities` oblik:

```json
{
  "listingTypes": ["buy", "rent"],
  "usages": ["residential", "commercial", "international"],
  "leadRouting": true,
  "showOnWebsite": true,
  "canReceiveWhatsApp": true,
  "canReceiveEmail": true
}
```

`properties` tabela treba dobiti:

- `agent_id TEXT`

Preporuka je da `agent_id` postane primarna veza, a postojeći `agent JSONB` ostane kao kompatibilni snapshot.

Zašto:

- ako se agentu promijeni telefon/slika/email, svi listingi mogu odmah prikazati live agent podatke
- snapshot i dalje čuva historiju i štiti od starih zapisa
- migracija je manji rizik jer ne lomi stare property podatke

## Migracija

1. Kreirati `agents` tabelu kroz `ensureAgentsSchema()`.
2. Seedovati Oussama i Oumaima ako tabela nema agente.
3. Dodati `agent_id` kolonu u `properties`.
4. Backfill:
   - ako `properties.agent.id` postoji i matcha agenta, postaviti `agent_id`
   - inače pokušati match po emailu
   - inače pokušati match po imenu
   - ako nema matcha, koristiti default active agenta
5. Nakon migracije, listing editor šalje `agentId`, a store puni snapshot iz live agent recorda.

## Novi admin modul

### Navigacija

U `AdminShell` dodati novu stavku:

- `/admin/agents`
- label: `Agents`
- icon: `Users` iz `lucide-react`

`current` tip treba proširiti na:

- `overview`
- `listings`
- `new`
- `edit`
- `agents`
- `agent-new`
- `agent-edit`

### Rute

Dodati:

- `app/admin/agents/page.tsx`
- `app/admin/agents/new/page.tsx`
- `app/admin/agents/[id]/page.tsx`

### Komponente

Dodati:

- `components/admin/admin-agents-table.tsx`
- `components/admin/admin-agent-editor.tsx`
- `components/admin/admin-agent-assignment-panel.tsx`
- `components/admin/admin-agent-image-upload.tsx`

### Store

Dodati:

- `lib/agents-store.ts`

Minimalne funkcije:

- `getAgents(options?: { includeInactive?: boolean })`
- `getActiveAgents()`
- `getDefaultAgent()`
- `getAgentById(id)`
- `upsertAgent(input)`
- `deleteAgentById(id)`
- `getAgentListingCounts()`
- `assignPropertiesToAgent(agentId, propertyIds)`
- `assignAllMatchingPropertiesToAgent(agentId, filters)`
- `transferPropertiesBetweenAgents(fromAgentId, toAgentId)`

### Server Actions

U `app/actions.ts` dodati:

- `saveAgentAction(input)`
- `deleteAgentAction(id)`
- `assignPropertiesToAgentAction(agentId, propertyIds)`
- `assignFilteredPropertiesToAgentAction(agentId, filters)`
- `transferAgentPropertiesAction(fromAgentId, toAgentId)`

Svaka action mora pozvati `assertAdmin()`.

Revalidate poslije agent promjena:

- `/admin`
- `/admin/agents`
- `/admin/listings`
- `/admin/listings/new`
- `/buy`
- `/rent`
- `/search`
- `/search/[slug]`
- `/properties/[slug]` za izmijenjene listinge
- `/sitemap.xml`

## Agent editor

Kada admin uđe u agenta, treba vidjeti:

### Profil

Polja:

- name
- role
- email
- phone
- WhatsApp
- image
- bio
- languages
- specialties
- active/inactive
- default agent
- sort order

### Mogućnosti

Checkbox/toggle grupe:

- Listing coverage: Buy, Rent
- Usage coverage: Residential, Commercial, International
- Lead routing enabled
- Show on website
- WhatsApp enabled
- Email enabled

### Area coverage

Multi-select za area coverage:

- The Pearl
- West Bay
- Lusail
- ostale postojeće areas iz `AREAS`

Ovo ne mora odmah ograničiti šta agent smije dobiti, ali je korisno za UI, lead routing i budući smart assignment.

### Listing assignment panel

U agent detail stranici treba postojati panel “Assigned Listings”.

Kontrole:

- search po title/location/slug/id
- filter po buy/rent
- filter po residential/commercial/international
- filter po draft/published
- filter po property type
- filter po area
- filter po trenutnom agentu

Akcije:

- select visible
- select all filtered
- clear selection
- assign selected to this agent
- assign all filtered to this agent
- transfer all from another agent to this agent
- open listing edit
- open public listing

Ovo pokriva zahtjev: “kad udjem u agenta mogu izabrati recimo sve ili šta već i prebaciti sve na tog agenta”.

## Bulk assignment pravila

### Assign selected

Admin bira checkboxe i klikne “Assign selected”.

Backend:

- validira admin session
- validira da agent postoji i da je active
- updateuje `properties.agent_id`
- updateuje `properties.agent` snapshot
- vraća broj izmijenjenih listinga i listu slugova za revalidate

### Select all filtered

Ne smije zavisiti samo od client liste ako filter može imati više rezultata nego trenutno prikazano.

Backend treba primiti filter objekat:

```ts
interface AgentAssignmentFilters {
  query?: string;
  listingType?: "all" | "buy" | "rent";
  visibilityStatus?: "all" | "draft" | "published";
  usage?: "all" | "residential" | "commercial" | "international";
  propertyType?: string;
  area?: string;
  currentAgentId?: string;
}
```

`assignAllMatchingPropertiesToAgent()` koristi iste filtere server-side i updateuje sve matching listinge.

### Transfer from agent

Admin izabere “from agent” i klikne “Transfer all to this agent”.

Backend:

- `UPDATE properties SET agent_id = toAgentId, agent = snapshot WHERE agent_id = fromAgentId`
- fallback match po starom `agent->>'id'` dok migracija ne bude čista

## Upload i resize agent slike

Trenutno `app/api/admin/upload-image/route.ts`:

- prima image file
- provjerava admin auth
- provjerava size do 10MB
- uploaduje raw file u R2/S3
- ne radi resize
- key uvijek ide pod `properties/`

Za agente treba dodati resize.

Preporuka:

- instalirati `sharp`
- napraviti reusable helper u `lib/image-processing.ts`
- proširiti storage upload da prima custom folder/key prefix
- dodati poseban route ili proširiti postojeći route sa `purpose=agent`

Bolje rješenje:

- `app/api/admin/upload-agent-image/route.ts`

Flow:

1. Admin uploaduje sliku.
2. Route validira admin session.
3. Route prima samo image file.
4. `sharp` radi:
   - auto rotate
   - crop/cover u kvadrat
   - resize na 512x512
   - output `webp`
   - kvalitet oko 82
5. Upload u storage pod:
   - `agents/{timestamp}-{slug}.webp`
6. Response vraća:
   - `key`
   - `url`
   - `width: 512`
   - `height: 512`

Opcionalno kasnije:

- 128x128 thumbnail
- 1024x1024 original profile crop
- delete starog `image_key` kad se zamijeni slika

Napomena: listing upload se može kasnije prebaciti na isti image pipeline, ali agent avatar je prvi prioritet.

## Šta brisati/čistiti

### Mock/generic agent

Ne treba više imati generičkog “Rise Property Advisor” ili sličnog mock agenta kao aktivni admin izbor.

Postojeća dva agenta treba seedovati automatski i oni su početni stvarni agenti.

### Hardcoded runtime agent lista

`PROPERTY_AGENTS` ne treba više direktno hraniti admin editor.

Umjesto toga:

- admin page fetchuje `getActiveAgents()`
- `AdminPropertyEditor` prima `agents` kao prop
- `formState.agentId` bira iz live agents liste

### Dupli fajlovi

Kandidati za cleanup nakon što se provjeri da nisu importovani:

- `components/admin/admin-dashboard 2.tsx`
- `lib/storage 2.ts`
- `app/privacy-policy/page 2.tsx`
- `app/terms-and-conditions/page 2.tsx`

### Lokacije

Postoje dva moguća puta:

- ili aktivirati `/admin/locations` i dodati ga u navigaciju
- ili privremeno ostaviti kao internal module dok agenti ne budu gotovi

Ne treba miješati agent refactor sa lokacijama osim ako cilj nije kompletan admin CMS pass.

## Predloženi redoslijed implementacije

### Faza 1: Agents store i migracija

- dodati agent tipove u `types/property.ts` ili novi `types/agent.ts`
- dodati `lib/agents-store.ts`
- seedovati Oussama i Oumaima
- dodati `agent_id` u `properties`
- backfill postojećih listinga
- prebaciti resolver da preferira live agent po `agent_id`

### Faza 2: Admin agents UI

- dodati `Agents` u `AdminShell`
- napraviti `/admin/agents`
- napraviti `/admin/agents/new`
- napraviti `/admin/agents/[id]`
- napraviti listu agenata sa search/status/counts
- napraviti editor za profil i mogućnosti

### Faza 3: Listing editor koristi live agente

- `app/admin/listings/new/page.tsx` fetchuje property types + active agents
- `app/admin/listings/[id]/page.tsx` fetchuje property + property types + active agents
- `AdminPropertyEditor` više ne importuje `PROPERTY_AGENTS`
- save payload šalje `agentId`

### Faza 4: Bulk assignment

- dodati assignment panel u agent detail
- dodati server actions za selected, filtered i transfer
- dodati revalidate logiku za pogođene listinge

### Faza 5: Image upload/resize

- dodati `sharp`
- dodati agent image upload route
- dodati upload UI u agent editor
- sačuvati `image_url` i `image_key`

### Faza 6: Cleanup

- ukloniti runtime zavisnost od hardcoded agenta
- ukloniti generic/mock agenta
- očistiti duple `* 2.*` fajlove ako nisu potrebni
- dokumentovati env varijable i admin workflow

## Acceptance checklist

Agent workflow je gotov kada:

- admin vidi `Agents` u sidebaru
- admin može dodati novog agenta
- admin može urediti postojećeg agenta
- admin može uploadovati agent sliku i sistem je resizeuje
- postojeća dva agenta se automatski dodaju u praznu bazu
- nema vidljivog mock/generic agenta u adminu
- listing editor bira agente iz baze
- property detail prikazuje live podatke agenta
- admin može ući u agenta i prebaciti selected listinge na njega
- admin može prebaciti sve filtrirane listinge na njega
- admin može prebaciti sve listinge sa jednog agenta na drugog
- draft i published listingi ostaju očuvani tokom transfera
- public stranice se revalidiraju poslije agent promjene

## Tehnička napomena za Next.js 16

Projekat koristi Next.js 16.2.1. Lokalne Next docs potvrđuju da App Router rute idu kroz `app/**/page.tsx`, API rute kroz `route.ts`, a mutacije kroz Server Actions ili Route Handlers. Za ovaj refactor treba nastaviti postojeći obrazac:

- Server Actions za DB mutacije iz admin UI-ja
- Route Handler za upload fileova
- `runtime = "nodejs"` za upload/resize
- `revalidatePath()` poslije agent/listing promjena
- admin auth provjera unutar svake mutation/upload funkcije

## Preporuka

Prvo uraditi agent data layer i admin CRUD, pa tek onda bulk assignment i image resize. To smanjuje rizik jer se prvo mijenja izvor istine, a zatim UI i masovne akcije.

Najbitnija arhitektonska odluka je da `agent_id` postane veza na live agenta, dok `agent JSONB` ostaje snapshot za kompatibilnost. Tako agenti postaju stvarno centralizovani, a stari listingi ne pucaju tokom migracije.
