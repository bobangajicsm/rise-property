# Zoho CRM Integracija Za Ovaj Projekat

Ovaj vodič je napisan za trenutni kod u ovom repo-u, ne generički.

## Quick Start Samo Za Leads

Ako želiš samo da proradi postojeći kod, idi ovim redom:

1. u Zoho API Console izaberi `Server-based Applications`
2. praviš integraciju za `Zoho CRM`, ne za `Zoho Forms`
3. redirect URI stavi na `http://localhost:3000/api/zoho/callback`
4. `Client ID` i `Client Secret` upiši u `.env.local`
5. pokreni:

```bash
npm run zoho:auth-url
```

6. otvori URL koji skripta ispiše
7. klikni `Allow`
8. Zoho će te vratiti na `/api/zoho/callback?code=...`
9. kopiraj taj `code`
10. pokreni:

```bash
npm run zoho:refresh-token -- YOUR_CODE
```

11. dobijeni `refresh token` zalijepi u `.env.local`
12. pokreni app sa:

```bash
npm run dev
```

13. pošalji test inquiry i lead bi trebao završiti u Zoho CRM

Šta tačno izabrati u Zoho-u:

- `Zoho CRM`: da
- `Zoho Forms`: ne
- `Server-based Application`: da
- `Client-based`, `Mobile`, `Self Client`: ne za ovaj postojeći kod

Trenutno stanje:

- javna kontakt forma šalje podatke na [components/contact/contact-inquiry-form.tsx](/Users/vaskrsijepanic/Desktop/Projects/rise-property/components/contact/contact-inquiry-form.tsx)
- backend ruta [app/api/zoho/lead/route.ts](/Users/vaskrsijepanic/Desktop/Projects/rise-property/app/api/zoho/lead/route.ts) već pravi zapis u `Leads`
- OAuth helper callback postoji u [app/api/zoho/callback/route.ts](/Users/vaskrsijepanic/Desktop/Projects/rise-property/app/api/zoho/callback/route.ts)
- potrebni env varovi su već u [.env.example](/Users/vaskrsijepanic/Desktop/Projects/rise-property/.env.example)

## Šta Je Ispravan Model Ovdje

Za ovaj projekat preporuka je:

- svaki novi upit sa sajta ide prvo u `Leads`
- tek kada agent potvrdi da je osoba stvarni kupac, zakupac ili investitor, taj zapis postaje `Client`
- `Client` u Zoho CRM-u treba da bude `Contact`
- `Account` dodaj samo ako radiš sa firmama, agencijama ili investitorskim kompanijama
- custom modul `Clients` pravi samo ako imaš baš poseban proces koji ne staje u `Contacts`

Drugim riječima:

| Poslovni pojam | Zoho modul | Preporuka |
| --- | --- | --- |
| novi web upit | `Leads` | da |
| fizička osoba koja je postala pravi klijent | `Contacts` | da |
| firma / agencija / kompanija | `Accounts` | po potrebi |
| prodajni proces za konkretnu nekretninu | `Deals` | opcionalno |
| custom `Clients` modul | custom module | samo ako imaš jak razlog |

Najpraktičnije za ovu aplikaciju je:

1. svi public form submission-i ostaju `Lead`
2. kada lead postane ozbiljan, konvertuje se u `Contact`
3. ako želiš pratiti konkretan buying/renting proces, tada se uz konverziju može otvoriti i `Deal`

## Zašto Ne Preporučujem Odmah Custom `Clients` Modul

Ako samo želiš "leadovi" i "klijenti", Zoho već to rješava sa:

- `Leads`
- `Contacts`
- po potrebi `Accounts`

Custom `Clients` modul uvodi dodatni posao:

- dodatni field mapping
- dodatne relacije
- dodatne permission-e
- dodatne API nazive polja
- dodatni posao oko deduplikacije

Zato je za ovaj repo najispravnije:

- `Lead` = osoba koja je poslala inquiry
- `Client` = isti čovjek, ali u `Contacts` nakon kvalifikacije

## OAuth I Env Setup

Ovaj projekat trenutno očekuje ove varijable:

```env
ZOHO_CLIENT_ID=
ZOHO_CLIENT_SECRET=
ZOHO_REFRESH_TOKEN=
ZOHO_ACCOUNTS_BASE_URL=https://accounts.zoho.com
ZOHO_API_BASE_URL=https://www.zohoapis.com
```

Ako si na EU data centru koristi:

```env
ZOHO_ACCOUNTS_BASE_URL=https://accounts.zoho.eu
ZOHO_API_BASE_URL=https://www.zohoapis.eu
```

Važno:

- backend koristi `refresh token`
- backend ne koristi privremeni `code` iz callback-a
- access token se osvježava server-side na svaki request prema Zoho API-ju

## Kako Napraviti Zoho App

U Zoho API Console napravi:

- `Client Type`: `Server-based Applications`
- `Homepage URL`: `http://localhost:3000`
- `Authorized Redirect URI`: `http://localhost:3000/api/zoho/callback`

Za production kasnije dodaj i pravi domen, na primjer:

```txt
https://your-domain.com/api/zoho/callback
```

## Scope-ovi Koje Preporučujem

Za najjednostavniji start možeš koristiti jedan širi scope:

```txt
ZohoCRM.modules.ALL
```

Ali za uredniji setup preporuka je uži skup scope-ova:

```txt
ZohoCRM.modules.leads.CREATE
ZohoCRM.modules.leads.READ
ZohoCRM.modules.contacts.CREATE
ZohoCRM.modules.contacts.READ
ZohoCRM.modules.contacts.UPDATE
ZohoCRM.modules.settings.READ
```

Ako ćeš raditi i lead conversion ili `Accounts` / `Deals`, dodaj i odgovarajuće scope-ove za te module.

## Trenutni Flow U Ovom Repo-u

Danas aplikacija radi ovo:

1. korisnik pošalje kontakt formu
2. frontend šalje payload na `/api/zoho/lead`
3. backend preko `refresh_token` dobije access token
4. backend radi `POST` prema Zoho `Leads` modulu
5. lead se snimi u CRM

Payload koji već postoji u aplikaciji:

- `firstName`
- `lastName`
- `email`
- `phone`
- `message`
- `propertyTitle`
- `propertyUrl`
- `inquiryType`
- `preferredDate`
- `preferredTime`
- `source`

To znači da već imaš dobar start za `Leads`. Ono što nedostaje za "clients" nije novi public form, nego jasan lifecycle poslije kreiranja lead-a.

## Preporučena Struktura Podataka

### Lead

Lead treba čuvati:

- ime i prezime
- email
- telefon
- poruku
- source
- tip upita
- naslov nekretnine
- URL nekretnine
- termin ako postoji

Zoho standardna polja koja već koristiš ili trebaš koristiti:

- `First_Name`
- `Last_Name`
- `Email`
- `Phone`
- `Description`
- `Lead_Source`

Preporučena custom polja u `Leads`:

- `Inquiry_Type`
- `Property_Title`
- `Property_URL`
- `Preferred_Date`
- `Preferred_Time`
- `Website_Source`

Napomena:

trenutno kod spaja dosta tih detalja u `Description`. To radi, ali je urednije dugoročno da glavne business podatke prebaciš u zasebna custom polja.

### Client

Ako želiš "client" zapis, koristi `Contacts`.

Preporučena polja za `Contacts`:

- `First_Name`
- `Last_Name`
- `Email`
- `Phone`
- `Mailing_Country` ili drugi lokacijski field ako ti treba
- custom polja kao:
  - `Client_Type` (`Buyer`, `Tenant`, `Landlord`, `Investor`)
  - `Interested_Property_URL`
  - `Interested_Property_Title`
  - `Client_Status`
  - `Budget_From`
  - `Budget_To`
  - `Preferred_Area`

Ako radiš sa firmama:

- `Account_Name` ide u `Accounts`
- `Contact` se veže na `Account`

## Kako Da Riješiš "Leads + Clients" Bez Duplikata

Ovo je najbitniji dio.

Nemoj raditi:

- svaki web inquiry u `Lead`
- pa odmah paralelno još jedan record u `Contacts`

To vrlo brzo napravi haos.

Umjesto toga:

### Opcija A: Lead pa kasnije konverzija u Contact

Ovo je preporučeni model.

Flow:

1. sajt pravi `Lead`
2. agent pregleda lead u Zoho-u
3. kada potvrdi da je osoba pravi klijent, lead se konvertuje u `Contact`
4. po potrebi se istovremeno pravi i `Account` i/ili `Deal`

Ovo je najbolji izbor ako:

- većina upita nije odmah kvalifikovana
- želiš sales pipeline
- želiš clean CRM

### Opcija B: Neki leadovi idu direktno u Contacts

Ovo ima smisla samo ako već znaš da forma nije "cold lead", nego već postojeći ili ozbiljan klijent.

Na primjer:

- interna admin forma
- rezervacijski flow nakon poziva
- forma za već potvrđenog kupca ili zakupca

U tom slučaju napravi poseban backend flow za `Contacts`, ne miješaj ga sa public inquiry formom.

## Kako Bih Ovo Implementirao U Ovom Repo-u

Najčišći plan je:

### 1. Zadrži trenutni `/api/zoho/lead`

Ova ruta treba ostati za:

- homepage kontakt formu
- property inquiry formu
- booking / viewing request formu

Tu se pravi isključivo `Lead`.

### 2. Dodaj zajednički helper za Zoho

Preporučena interna struktura:

- `lib/zoho.ts`

U taj helper izdvoji:

- `getZohoAccessToken()`
- `createZohoLead()`
- `searchZohoContactByEmail()`
- `upsertZohoContact()`
- `convertZohoLeadToContact()` ili helper oko conversion flow-a

Tako nećeš imati dupliran OAuth kod po route-ovima.

### 3. Dodaj poseban route za clients

Preporučena ruta:

- `app/api/zoho/client/route.ts`

Ta ruta ne bi trebala biti public marketing form endpoint.
Nju koristiš za:

- admin dashboard
- interni workflow
- ručno kvalifikovan lead

Ta ruta radi jedno od ovo dvoje:

- upsert u `Contacts`
- ili conversion postojećeg `Lead` zapisa u `Contact`

### 4. Preferiraj conversion umjesto duplog kreiranja

Ako kontakt nastaje iz lead-a, bolji izbor je conversion.

Razlog:

- Zoho zadržava logičan sales tok
- manji rizik od duplikata
- agentima je jasnije šta je novo, a šta kvalifikovano

### 5. Koristi email kao glavni dedupe ključ

Za website flow preporuka je:

- email koristiš kao glavni lookup
- phone koristiš kao sekundarnu provjeru

Ako radiš `Contacts` upsert, gledaj prvo da ne napraviš novi contact ako već postoji isti email.

## Minimalni API Primjeri

### Authorization URL Za Dobijanje Privremenog Code-a

Primjer za US:

```txt
https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCRM.modules.ALL&client_id=YOUR_CLIENT_ID&response_type=code&access_type=offline&redirect_uri=http://localhost:3000/api/zoho/callback&prompt=consent
```

Primjer za EU:

```txt
https://accounts.zoho.eu/oauth/v2/auth?scope=ZohoCRM.modules.ALL&client_id=YOUR_CLIENT_ID&response_type=code&access_type=offline&redirect_uri=http://localhost:3000/api/zoho/callback&prompt=consent
```

### Exchange Code Za Refresh Token

US:

```bash
curl --request POST \
  --url "https://accounts.zoho.com/oauth/v2/token" \
  --header "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "grant_type=authorization_code" \
  --data-urlencode "client_id=YOUR_CLIENT_ID" \
  --data-urlencode "client_secret=YOUR_CLIENT_SECRET" \
  --data-urlencode "redirect_uri=http://localhost:3000/api/zoho/callback" \
  --data-urlencode "code=YOUR_CODE"
```

EU:

```bash
curl --request POST \
  --url "https://accounts.zoho.eu/oauth/v2/token" \
  --header "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "grant_type=authorization_code" \
  --data-urlencode "client_id=YOUR_CLIENT_ID" \
  --data-urlencode "client_secret=YOUR_CLIENT_SECRET" \
  --data-urlencode "redirect_uri=http://localhost:3000/api/zoho/callback" \
  --data-urlencode "code=YOUR_CODE"
```

Sačuvaj samo `refresh_token` u `.env.local`.

### Kreiranje Leada

Current route u ovom repo-u radi prema:

```txt
POST {ZOHO_API_BASE_URL}/crm/v2/Leads
```

To je u redu jer trenutna implementacija već radi tim putem.
Ako budeš radio novu Zoho apstrakciju za leads i clients, preporuka je da standardizuješ nove route-ove na isti API version svuda, idealno `v8`, nakon što potvrdiš kompatibilnost u svom Zoho account-u.

Preporučeni payload shape:

```json
{
  "data": [
    {
      "First_Name": "Ana",
      "Last_Name": "Kovac",
      "Email": "ana@example.com",
      "Phone": "+38599111222",
      "Lead_Source": "Website Contact",
      "Description": "Message: Interested in the property and viewing."
    }
  ]
}
```

### Kreiranje Ili Update Client-a

Ako radiš client flow kroz `Contacts`, ciljaj:

```txt
POST {ZOHO_API_BASE_URL}/crm/v8/Contacts/upsert
```

Praktična ideja:

- kao primary duplicate key koristi `Email`
- ako contact postoji, update-aj ga
- ako ne postoji, kreiraj ga

Ako ne želiš upsert odmah, možeš:

1. search po email-u
2. ako postoji `Contact`, radi `update`
3. ako ne postoji, radi `insert`

## Preporučeni Lifecycle Za Nekretnine

Za ovaj biznis bih koristio ovakav lifecycle:

1. visitor pošalje formu sa sajta
2. zapis ide u `Leads`
3. agent pregleda inquiry i kontaktira osobu
4. ako osoba nije kvalifikovana, ostaje `Lead`
5. ako osoba jeste kvalifikovana, lead se konvertuje u `Contact`
6. ako postoji konkretna prodajna/rental prilika, otvori se `Deal`

To je čišće nego da od prvog trenutka imaš i `Lead` i `Client`.

## Šta Bih Promijenio U Trenutnom Kodu Kad Krene Implementacija

Ako budeš radio puni implementation, preporučujem ove korake:

1. izdvojiti Zoho OAuth i API helper u `lib/zoho.ts`
2. ostaviti [app/api/zoho/lead/route.ts](/Users/vaskrsijepanic/Desktop/Projects/rise-property/app/api/zoho/lead/route.ts) samo za validaciju requesta i `createZohoLead`
3. dodati `app/api/zoho/client/route.ts` za internal/client flow
4. dodati custom Zoho fields umjesto da sve ide u `Description`
5. dodati dedupe logiku po email-u
6. po želji dodati lead conversion flow umjesto ručnog dupliranja record-a

## Test Checklist

Prije production puštanja provjeri:

1. public forma pravi `Lead` bez greške
2. `Lead_Source` i `Inquiry_Type` dolaze ispravno
3. property title i property URL se snimaju
4. isti email ne pravi neželjene duplikate u `Contacts`
5. client flow pravi ili update-a `Contact`
6. production callback URL je dodat u Zoho app
7. region URL-ovi odgovaraju stvarnom Zoho data centru

## Kratka Preporuka

Ako želiš "ispravno" rješenje u ovom projektu, idi ovako:

- javne forme -> `Leads`
- kvalifikovani klijenti -> `Contacts`
- firme -> `Accounts`
- konkretan prodajni/rental process -> `Deals`
- custom `Clients` modul nemoj uvoditi dok ne dokažeš da `Contacts` nije dovoljan

## Korisni Zvanični Linkovi

- Zoho Accounts OAuth overview: https://www.zoho.com/accounts/protocol/oauth/sign-in-using-zoho.html
- Zoho CRM Insert Records API: https://www.zoho.com/crm/developer/docs/api/v8/insert-records.html
- Zoho CRM Upsert Records API: https://www.zoho.com/crm/developer/docs/api/v8/upsert-records.html
- Zoho CRM Get Records API: https://www.zoho.com/crm/developer/docs/api/v8/get-records.html
- Zoho CRM Lead Conversion Options: https://www.zoho.com/crm/developer/docs/api/v8/lead-conversion-options.html

## Zaključak

Za ovaj repo nema potrebe da praviš dva paralelna public flow-a za `Lead` i `Client`.

Najispravnije je:

- website inquiry ide u `Lead`
- tek nakon kvalifikacije osoba postaje `Contact`

Ako želiš, sljedeći korak mogu odmah i da implementiram:

- `lib/zoho.ts`
- `app/api/zoho/client/route.ts`
- dedupe po email-u
- clean mapping za Zoho custom fields
