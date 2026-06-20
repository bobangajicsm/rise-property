# Make An Offer Button - Procjena I Scope

Ovaj dokument opisuje najbezbolniji način da se na Rise Property listing detail stranici doda `Make an offer` flow, bez lomljenja postojeće Zoho integracije i bez mijenjanja postojećeg property modela.

## Kratki Zaključak

Preporuka je da se `Make an offer` uradi kao novi frontend modal koji šalje lead u postojeći Zoho endpoint:

- postojeći endpoint: `POST /api/zoho/lead`
- postojeći Zoho modul: `Leads`
- postojeća baza `properties`: ne mijenja se
- postojeći `Book a Viewing`: ostaje kako jeste
- novi offer podaci idu u Zoho `Description` i kroz `inquiryType/source`

To je najčistiji MVP jer već postoji stabilan kanal za property upite, book viewing i WhatsApp lead tracking.

## Trenutno Stanje U Kodu

Relevantni postojeći fajlovi:

- [components/detail/property-detail-page.tsx](/Users/vaskrsijepanic/Desktop/Projects/rise-property/components/detail/property-detail-page.tsx)
- [components/site/booking-modal.tsx](/Users/vaskrsijepanic/Desktop/Projects/rise-property/components/site/booking-modal.tsx)
- [app/api/zoho/lead/route.ts](/Users/vaskrsijepanic/Desktop/Projects/rise-property/app/api/zoho/lead/route.ts)
- [lib/properties-store.ts](/Users/vaskrsijepanic/Desktop/Projects/rise-property/lib/properties-store.ts)
- [types/property.ts](/Users/vaskrsijepanic/Desktop/Projects/rise-property/types/property.ts)

Property detail stranica sada ima CTA card sa:

- `Request Details`
- `Book a Viewing`

`Book a Viewing` već otvara `BookingModal`, a `BookingModal` već šalje payload na `/api/zoho/lead` sa property kontekstom:

- property id/reference
- title
- URL
- type
- listing type
- area/location
- price
- beds/baths/sqft
- assigned agent
- preferred viewing date/time ako postoji

Zoho ruta već prima `inquiryType`, `source`, `message` i property metadata, pa se offer flow može uklopiti bez posebne nove integracije.

## Preporučeni UX

Na property detail price cardu prikazati dva jasna dugmeta:

1. `Book a Viewing`
2. `Make an Offer`

Prema slikama, najbliži target je:

- primary crno dugme: `Book a Viewing`
- secondary outline dugme: `Make an Offer`

To znači da se postojeći `Request Details` CTA na toj kartici može zamijeniti ili premjestiti, a `Book a Viewing` ostaje povezan na postojeći viewing flow.

Na donjem `Next Step` CTA bloku može se uraditi isto usklađivanje:

- `Book a Private Viewing`
- `Make an Offer`

ili se donji blok može ostaviti za kasnije ako želiš minimalnu promjenu samo na glavnoj price kartici.

## Make Offer Modal

Novi modal bi trebao tražiti samo podatke koji su stvarno potrebni agentu da kvalifikuje ponudu:

- full name
- email
- phone
- offer amount
- buyer/renter status
- financing/payment status
- optional move-in date ili target completion date
- optional message

Za rent listing:

- `Offer Amount` znači mjesečna renta koju korisnik nudi
- opcionalno: `Move-in date`

Za buy listing:

- `Offer Amount` znači kupoprodajna ponuda
- opcionalno: `Payment status` kao `Cash`, `Mortgage`, `Pre-approved`, `Need advice`

## Zoho Payload

Za MVP ne treba novi Zoho endpoint. Novi modal može slati na postojeći:

```txt
POST /api/zoho/lead
```

Preporučene vrijednosti:

- `inquiryType`: `Property Offer`
- `source`: `Website Make Offer`
- `message`: strukturisan tekst sa offer detaljima

Primjer `message` sadržaja koji završi u Zoho `Description`:

```txt
Offer Amount: QAR 13,800 / month
Buyer/Renter Status: Ready to proceed
Move-in Date: 2026-06-15
Message: I am interested if the landlord can accept this amount.
```

Postojeća Zoho ruta već upisuje:

- `First_Name`
- `Last_Name`
- `Email`
- `Phone`
- `Mobile`
- `Website`
- `Designation`
- `Annual_Revenue`
- `Description`
- `Lead_Source`

Za offer flow `Designation` može ostati `Property Offer`, a `Lead_Source` može biti `Website Make Offer`.

## Baza I Model

Za ovu fazu ne preporučujem diranje postojeće `properties` tabele.

Razlog:

- offer nije property atribut
- offer je lead/inquiry event
- postojeći Zoho `Leads` flow već služi za ovakve submissione
- manji rizik za admin, listing save, search, SEO i sitemap logiku

Ako kasnije želiš interni audit trail izvan Zoho-a, onda se može dodati zasebna tabela, ne proširenje property modela:

```txt
property_offers
```

Ali to nije potrebno za MVP.

## Fajlovi Koji Bi Se Mijenjali

Minimalni MVP:

- [components/detail/property-detail-page.tsx](/Users/vaskrsijepanic/Desktop/Projects/rise-property/components/detail/property-detail-page.tsx)
  - dodati `make-offer` modal state
  - promijeniti CTA redoslijed/labeling
  - otvoriti novi offer modal na `Make an Offer`

- novi fajl, preporučeno:
  - `components/site/make-offer-modal.tsx`
  - ili proširiti postojeći `BookingModal` sa novim mode-om ako želiš manje fajlova

- [app/api/zoho/lead/route.ts](/Users/vaskrsijepanic/Desktop/Projects/rise-property/app/api/zoho/lead/route.ts)
  - opcionalno proširiti `LeadPayload` sa offer-specific fieldovima
  - ili bez promjene route-a poslati offer detalje kroz postojeći `message`

Preporuka: novi modal + minimalno proširenje tipova u `/api/zoho/lead` samo ako želiš čistije fieldove. Ne dirati `types/property.ts` za ovo.

## Implementacione Opcije

### Opcija A - Najbrži MVP

Dodati `MakeOfferModal` koji koristi postojeći `/api/zoho/lead` i sve offer detalje šalje kroz `message`.

Procjena:

- razvoj: 3 do 5 sati
- testiranje: 1 do 2 sata
- ukupno: 0.5 do 1 radni dan

Prednosti:

- najmanji rizik
- ne dira bazu
- ne dira Zoho OAuth
- brzo dostupno agentima u Zoho Leads

Mana:

- offer detalji su tekstualno strukturisani u `Description`, ne kao posebna Zoho custom polja

### Opcija B - Uredniji MVP Sa Offer Fieldovima

Dodati `MakeOfferModal`, a `/api/zoho/lead` proširiti da primi:

- `offerAmount`
- `offerCurrency`
- `offerType`
- `paymentStatus`
- `targetDate`

Ruta ih zatim formatira u `Description`.

Procjena:

- razvoj: 5 do 7 sati
- testiranje: 1 do 2 sata
- ukupno: 1 radni dan

Prednosti:

- čišći kod
- lakše kasnije prebaciti u Zoho custom fields
- i dalje bez promjene property modela

Mana:

- malo veći scope od najbržeg MVP-a

### Opcija C - Zoho Custom Fields

Uz frontend modal, u Zoho `Leads` dodati custom polja:

- `Offer_Amount`
- `Offer_Currency`
- `Offer_Type`
- `Payment_Status`
- `Target_Date`
- `Property_Reference`
- `Property_URL`

Zatim backend mapira offer direktno u ta polja.

Procjena:

- Zoho field setup: 1 do 2 sata
- razvoj: 1 do 1.5 dana
- testiranje: 0.5 dana
- ukupno: 2 do 3 radna dana

Prednosti:

- agentima je najurednije u Zoho-u
- ponude se mogu filtrirati/reportovati

Mana:

- mora se potvrditi tačan API name svakog Zoho custom fielda
- veći rizik ako field names nisu 100% tačni
- potrebno malo više Zoho administracije

## Moja Preporuka

Za trenutnu fazu preporučujem Opciju B.

To znači:

- ne mijenjati `properties` tabelu
- ne dodavati novu baznu tabelu
- ne dirati postojeći property model
- dodati novi `MakeOfferModal`
- proširiti `/api/zoho/lead` samo za offer input fieldove ako treba
- i dalje slati sve u Zoho `Leads`

Procjena za ovaj pristup:

```txt
1 radni dan
```

Ako želiš baš samo najbrži button + modal bez dodatnog backend shape-a:

```txt
0.5 radnog dana
```

Ako želiš odmah uredne Zoho custom fields i reporting:

```txt
2 do 3 radna dana
```

## Test Checklist

Prije merge/deploy-a provjeriti:

1. Property detail stranica prikazuje `Book a Viewing` i `Make an Offer`.
2. `Book a Viewing` radi isto kao prije.
3. `Make an Offer` otvara modal.
4. Required polja validiraju submit.
5. Submit kreira Zoho lead.
6. Zoho lead ima `Lead_Source = Website Make Offer`.
7. Zoho lead ima `Designation = Property Offer`.
8. `Description` sadrži property podatke i offer podatke.
9. Mobile layout nema preklapanja buttona ili modal inputa.
10. `npm run build` prolazi.

## Rizici

Glavni rizici su mali ako ostanemo na postojećem Zoho lead flow-u.

Potencijalni rizici:

- Zoho env varovi nisu podešeni u productionu
- Zoho API field name mismatch ako se odmah ide na custom polja
- korisnici mogu poslati nerealne offer amount vrijednosti ako ne stavimo osnovnu validaciju
- `Request Details` nestaje sa glavne kartice ako ga zamijenimo sa `Make an Offer`, pa treba potvrditi da li ga želiš potpuno ukloniti ili ostaviti negdje niže

## Otvorena Odluka

Jedina stvar koju treba potvrditi prije implementacije:

```txt
Da li na glavnoj price kartici potpuno mijenjamo Request Details u Make an Offer,
ili želiš tri CTA-a: Request Details, Book a Viewing, Make an Offer?
```

Po slikama i tvom opisu, preporuka je da glavna kartica ima samo:

```txt
Book a Viewing
Make an Offer
```
