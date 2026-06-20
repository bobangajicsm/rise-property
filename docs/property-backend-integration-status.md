# Property Backend Integration Status

Ovaj dokument kratko objašnjava šta je trenutno stvarno spojeno sa backendom, a šta je još sistemski definisano u kodu.

## Kratki odgovor

- `Residential / Commercial`: jesu vezani za backend na nivou svakog property-ja.
- `Buy / Rent`: jesu vezani za backend na nivou svakog property-ja.
- `Property Types` tipa `Apartment`, `Villa`, `Office`: sada su dinamički i dolaze iz backend konfiguracije.
- Same opcije `Residential / Commercial` i `Buy / Rent` nisu još “admin-configurable kategorije”, nego su core sistemske vrijednosti aplikacije.

Drugim riječima:

- property može u bazi imati:
  - `listingType = buy | rent`
  - `usage = residential | commercial`
  - `type = Apartment | Villa | Penthouse | Office | ...`
- ali samo `type` sada ima poseban dinamički management layer u adminu
- `usage` i `listingType` su i dalje osnovna, zakucana poslovna pravila sistema

## Šta je već spojeno sa backendom

### 1. `Buy / Rent`

Ovo je backend field na property modelu.

- definisano u `Property` i `PropertyMutationInput`
- čuva se kao `listing_type` u `properties` tabeli
- koristi se kod:
  - admin create/edit forme
  - `/buy`
  - `/rent`
  - `/search`
  - property detail stranica
  - SEO metadata / sitemap logike

Trenutni zaključak:

- `Buy / Rent` nije samo vizuelni toggle
- svaki listing stvarno nosi svoju `buy` ili `rent` vrijednost iz backend-a

### 2. `Residential / Commercial`

Ovo je takođe backend field na property modelu.

- definisano kao `usage`
- čuva se u `properties` tabeli
- koristi se u admin editoru
- koristi se u listing/search filterima
- koristi se u public listingu za segmentaciju rezultata

Trenutni zaključak:

- `Residential / Commercial` nije samo frontend label
- svaki property stvarno ima svoj `usage`

### 3. `Property Types`

Ovo je sada zasebno backend-konfigurisano.

- postoji `property_types` store / tabela
- admin dashboard sada može dodavati i gasiti types
- create/edit forma čita type opcije odatle
- listing/search filter za type čita iste opcije
- postojeći listingi automatski “seeduju” missing type ako je već korišten u inventory-ju

Primjer:

- ako dodaš `Townhouse` kao residential type u adminu
- taj type postaje dostupan u:
  - create listing
  - edit listing
  - search/listing filters

## Šta je još zakucano

### 1. `Residential / Commercial` kao sam izbor

Iako se `usage` čuva u backendu, same dvije vrijednosti su još sistemski definisane:

- `residential`
- `commercial`

To znači:

- admin ne može dodati treću usage grupu tipa `land`, `hospitality`, `industrial`
- UI i logika računaju da postoje baš te dvije grupe

Status:

- backend-driven value po property-ju: `DA`
- admin-configurable taxonomy: `NE`

### 2. `Buy / Rent` kao sam izbor

Isto važi i za listing mode:

- `buy`
- `rent`

To znači:

- property stvarno ima `listingType` u bazi
- ali admin ne može dodavati treće stanje tipa `off-plan`, `short-let`, `holiday-home`

Status:

- backend-driven value po property-ju: `DA`
- admin-configurable taxonomy: `NE`

### 3. Fallback logika još pretpostavlja postojeći sistem

Postoji još nekoliko mjesta gdje je poslovna logika namjerno vezana za trenutni model:

- commercial/residential segment switch na listing stranici
- buy/rent routing kroz `/buy`, `/rent`, `/search`
- određeni fallbackovi i URL builderi računaju na dvije listing vrste
- dio fallback logike i dalje zna da je `Office` commercial ako fali `usage`

To nije bug, nego trenutni arhitektonski izbor.

## Trenutno stanje po stavkama

### `usage`

- backend field: `DA`
- čuva se u bazi: `DA`
- koristi se u filterima: `DA`
- dinamički admin management: `NE`

### `listingType`

- backend field: `DA`
- čuva se u bazi: `DA`
- koristi se u `/buy` i `/rent`: `DA`
- dinamički admin management: `NE`

### `type`

- backend field: `DA`
- čuva se u bazi: `DA`
- koristi se u filterima: `DA`
- dinamički admin management: `DA`

## Ako hoćeš da bude “skroz backend-driven”

Ako želiš i `Residential / Commercial` i `Buy / Rent` da budu administrabilni kao `type`, onda bi sljedeći korak bio:

1. Uvesti zasebne konfiguracione tabele za:
   - `property_usages`
   - `listing_modes`
2. Zamijeniti hardcoded unije:
   - `"residential" | "commercial"`
   - `"buy" | "rent"`
3. Refaktorisati:
   - admin editor
   - listing routes
   - search filters
   - SEO metadata
   - URL buildere
   - sitemap logiku
4. Odluka:
   - da li i dalje želiš posebne route-ove `/buy` i `/rent`
   - ili sve vodiš kroz jedan dinamički search/catalog sistem

## Preporuka

Za ovaj projekat trenutno je najbolji balans:

- `Buy / Rent` ostaviti kao core sistemske vrijednosti
- `Residential / Commercial` ostaviti kao core sistemske vrijednosti
- `Property Types` držati dinamički, što je sada već urađeno

Zašto:

- to je najčistiji model za real estate sajt ovog tipa
- ne komplikuje SEO i URL strukturu
- admin dobija fleksibilnost tamo gdje je stvarno treba: na `type`
- izbjegavaš prevelik refactor oko rutinga i metadata logike

## Šta još nije kompletno centralizovano

Ako želiš sljedeći pass, ovo su najbolje naredne backend stavke:

1. Server-side validation za property save
2. `draft / published / archived` status za property
3. audit log za admin izmjene
4. soft delete za listinge
5. optional backend-configurable `usage` i `listingType` taxonomies ako baš želiš širi CMS model

## Finalni zaključak

Trenutno:

- `Buy / Rent` je backend povezan
- `Residential / Commercial` je backend povezan
- `Property Types` su backend povezani i dinamički

Ali:

- `Buy / Rent` i `Residential / Commercial` još nisu “admin definisane kategorije”
- oni su i dalje osnovna, zakucana pravila aplikacije

To znači da je property model sada dobro odrađen za real estate workflow, ali nije još potpuno “headless CMS taxonomy everywhere” sistem.
