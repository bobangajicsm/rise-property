# Admin Panel Agents & Listings Work Summary

Datum: 2026-07-01  
Status: Implementirano u kodu, build provjeren, baza nije resetovana.

## Kratki Pregled

Urađen je veći admin panel upgrade oko agenata, listinga, dodjele vlasništva listinga agentima, agent slika, UX-a listing tabele i sigurnijih potvrda za opasne akcije.

Glavni cilj je bio da se agenti više ne vode kao mock/static data, nego da se mogu normalno praviti, uređivati, brisati/deaktivirati i koristiti kroz admin panel. Posebno je vođeno računa da se produkcija ne poremeti jer se koristi ista baza.

## Produkcijska Sigurnost

Sve promjene su rađene konzervativno:

- Nije resetovana baza.
- Nisu rađene destruktivne migracije.
- Sva nova DB polja su opcionalna/additive.
- Stari `agent` JSON snapshot na listingima je zadržan.
- Novi `agent_id` je dodat kao opcioni link, tako da stari podaci i dalje rade.
- Ako `agent_id` ne postoji, aplikacija i dalje koristi stari `agent.id` iz JSON snapshota.
- Postojeći public listing URL-ovi, slike, slugovi i sadržaj listinga ostaju netaknuti.

## Analiza I Plan

Kreiran je dokument:

- `docs/app-analysis-and-admin-agents-plan.md`

U njemu je opisan trenutni app setup, admin panel stanje, agent plan, baza i UX smjer prije implementacije.

Također su pregledani relevantni Next.js lokalni docs iz `node_modules/next/dist/docs/`, jer projekat koristi Next.js 16.2.1 i pravila u `AGENTS.md` naglašavaju da nije klasični Next.js API iz starijih verzija.

## Agent Sistem

### Novi Managed Agent Model

Dodan je managed agent model koji podržava:

- `id`
- `slug`
- `name`
- `role`
- `image`
- `imageKey`
- `phone`
- `email`
- `whatsapp`
- `bio`
- `languages`
- `specialties`
- `areas`
- `capabilities`
- `isActive`
- `isDefault`
- `sortOrder`
- `listingCount`

Ovo omogućava da agenti budu stvarni admin-managed entiteti, a ne samo hardcoded mock podaci.

### Agent Capabilities

Dodane su agent opcije/capabilities:

- listing types koje agent može pokrivati
- usage tipovi koje agent može pokrivati
- lead routing
- prikaz na web stranici
- WhatsApp kontakt opcija
- email kontakt opcija

Sve je opcionalno i ima default vrijednosti da se ne ruši postojeći tok.

### Seed Agenti

Postojeća dva agenta su ubačena kao default managed agenti:

- Oussama Sabbagh
- Oumaima Lounissi

Oni služe kao inicijalni agenti, ali više nisu zamišljeni kao mock data koji blokira CRUD.

### Agent CRUD

Dodan je full CRUD flow kroz admin panel:

- lista agenata
- kreiranje agenta
- edit agenta
- delete/deactivate agent
- default agent zaštita
- prikaz broja listinga po agentu
- aktivan/neaktivan status

Nove admin rute:

- `app/admin/agents/page.tsx`
- `app/admin/agents/new/page.tsx`
- `app/admin/agents/[id]/page.tsx`

Nove admin komponente:

- `components/admin/admin-agents-table.tsx`
- `components/admin/admin-agent-editor.tsx`
- `components/admin/admin-agent-assignment-panel.tsx`

Admin sidebar je proširen tako da ima ulaz za Agents.

## Agent Store I Baza

Dodan je novi store:

- `lib/agents-store.ts`

On radi:

- sigurno kreiranje `agents` tabele ako ne postoji
- dodavanje opcionalnog `agent_id` polja na `properties`
- seed inicijalnih agenata
- backfill `agent_id` iz postojećeg `agent` JSON snapshota
- brojanje listinga po agentu
- upsert agenta
- delete/deactivate agenta
- update listing snapshot-a kad se agent promijeni
- assign listinga agentu
- assign filtered listinga agentu
- transfer listinga između agenata

Važno: backfill je additive i koristi postojeće podatke. Ne briše postojeće listinge.

## Listing Agent Veza

U `types/property.ts` dodan je `agentId?: string`, dok je postojeći `agent: PropertyAgent` ostao.

U `lib/properties-store.ts` mapiranje sada radi ovako:

- ako postoji `agent_id`, koristi njega
- ako ne postoji, koristi `agent.id` iz JSON snapshota
- prilikom save/update listinga, čuva se i `agent_id` i agent snapshot

Ovo je urađeno zbog kompatibilnosti sa postojećom produkcionom bazom.

## Dodjela Listinga Agentima

U agent edit ekranu dodat je assignment panel.

Panel podržava:

- search listinga
- filter po listing type
- filter po visibility statusu
- filter po usage tipu
- filter po property type
- filter po area
- filter po trenutnom agentu
- assign selected listinga
- assign all filtered listinga
- transfer svih listinga sa jednog agenta na drugog

### Ispravka Checkbox Stanja

Popravljeno je da listinzi koji već pripadaju agentu budu automatski checked kada se otvori agent.

Prije toga je backend znao koji listing pripada agentu, ali UI checkbox state je kretao prazan. Sada postojeće dodjele ulaze kao base selection, a ručni klikovi samo privremeno mijenjaju odabir.

Također je default filter u agent assignment panelu postavljen na trenutno otvorenog agenta, da se odmah vide njegovi listinzi.

### Manje Skrolanja

Assignment panel je složen tako da je pregledniji:

- trenutni agentovi listinzi su odmah filtrirani
- vidljivo je koliko je listinga selected i koliko je filtered
- reset vraća selection na stvarno trenutno stanje
- transfer i assign filtered koriste iste čiste custom potvrde

## Brisanje Agenta Sa Listingima

Dodan je novi flow za slučaj kada agent ima listinge i korisnik ga želi obrisati.

Sada admin panel pita:

- agent ima dodijeljene listinge
- na kojeg drugog agenta želiš prebaciti te listinge
- tek nakon izbora radi se transfer
- nakon transfera se agent briše

Ako nema drugog aktivnog agenta za prebacivanje, dialog kaže da treba kreirati ili aktivirati drugog agenta prije brisanja.

Implementacija koristi postojeću backend akciju za transfer:

- `transferAgentPropertiesAction(fromAgentId, toAgentId)`

Nakon transfera se poziva:

- `deleteAgentAction(agent.id)`

Time se izbjegava gubitak listing ownership podataka.

## Agent Slike

Dodana je upload i crop funkcionalnost za agent sliku.

### Upload Endpoint

Dodan endpoint:

- `app/api/admin/upload-agent-image/route.ts`

Radi:

- prima upload slike
- resize/crop na avatar format
- koristi `sharp`
- sprema pod `agents/` folder
- vraća URL i storage key

### Crop UI

U agent editoru dodan je crop UI:

- canvas preview
- zoom slider
- horizontal position
- vertical position
- upload crop

Dodana je i mogućnost "unzoom", tako da slider može ići ispod 1x (`0.65x`) kada slika izgleda previše približeno.

Agent avatar se prikazuje sa `object-top` gdje je bitno da lice bolje sjeda u krug/kadar.

## Admin Listings UX

Admin listing tabela je preuređena da bude preglednija i manje opterećena informacijama.

Defaultno se prikazuje samo najbitnije:

- slika
- naslov
- lokacija
- public link
- cijena
- agent avatar
- akcije

Ostale kolone su opcionalne kroz column picker:

- status
- category
- area
- agent
- reference

### Agent Avatar U Listing Listi

Agent je sada defaultno prikazan u listing listi kao mali kružni avatar.

Važno:

- agent ime se vizuelno ne prikazuje
- prikazuje se samo avatar
- ime ostaje kao `title` i accessibility label
- avatar ne zauzima puno prostora u tabeli
- na mobile kartici avatar stoji uz naslov listinga

Ako agent nema sliku, prikazuju se inicijali.

## Mobile UX

Admin listings mobile kartice su sređene da prikazuju:

- property sliku
- naslov
- lokaciju
- link
- cijenu
- agent avatar
- akcije
- opcionalne chipove samo ako su kolone uključene

Također je status update na mobilnom edit listing ekranu promijenjen:

- prikazuje se samo ako ima izmjena
- fixed je i mali
- ne smeta sadržaju
- ako nema izmjene, ne prikazuje se

## Custom Alert Dialogs

Dodan je reusable admin dialog:

- `components/admin/admin-confirm-dialog.tsx`

Zamjenjuje native browser `window.confirm` i `window.alert` flow.

Podržava:

- title
- description
- confirm label
- cancel label
- pending/loading state
- danger/primary/accent variant
- disabled confirm
- custom children content, npr. select za transfer listinga

Primijenjen je na:

- delete listing
- delete/deactivate/delete agent
- transfer listinga prije delete agenta
- assign all filtered listinga
- transfer listinga u agent assignment panelu
- legacy admin dashboard delete akcije

Nakon izmjene više nema `window.confirm` ili `window.alert` u `app`, `components`, `lib`, `data`, `types`.

## Legacy Admin Dashboard Cleanup

Iako trenutni `app/admin` koristi nove komponente, očišćeni su i legacy fajlovi:

- `components/admin/admin-dashboard.tsx`
- `components/admin/admin-dashboard 2.tsx`

U njima su native confirm dijalozi zamijenjeni shared `AdminConfirmDialog` komponentom.

## Backend Akcije

U `app/actions.ts` dodane/proširene su akcije:

- `saveAgentAction`
- `deleteAgentAction`
- `assignPropertiesToAgentAction`
- `assignFilteredPropertiesToAgentAction`
- `transferAgentPropertiesAction`
- `loginAgent`

Sve akcije rade admin auth provjeru i revalidate relevantne pathove.

## Agent Login I Ograničen Pristup

Dodan je poseban agent login flow za zahtjev klijenta da svaki agent ima svoj username/password i vidi samo svoje listinge.

### Šta Main Admin Može

Main admin u agent editoru sada može:

- uključiti ili isključiti `Agent Login Access`
- postaviti agent username
- postaviti password
- promijeniti password kasnije bez prikaza starog passworda
- vidjeti u agent listi badge `Login Enabled`

Password se ne čuva plain-text.

Čuva se:

- `password_hash`
- `password_salt`

Username se normalizuje na lowercase.

### Sigurne DB Promjene

Na `agents` tabelu dodana su samo opciona polja:

- `login_username`
- `password_hash`
- `password_salt`
- `can_login`

Dodani su sa `ADD COLUMN IF NOT EXISTS`.

Dodani su bez resetovanja baze i bez obaveznih vrijednosti za postojeće agente.

Dodana je i parcijalna unique zaštita za `login_username`, samo kada username postoji.

### Agent Login Ekran

Na postojećem `/admin/login` ekranu sada postoje dva odvojena login dijela:

- Main Admin login
- Agent Access login

Agent login koristi username/password koji main admin kreira u agent profilu.

Nakon uspješnog login-a agent ide na:

- `/admin/listings`

### Šta Agent Vidi

Agent vidi samo:

- admin listings page
- listinge koji su dodijeljeni njegovom `agent_id`
- edit ekran za vlastite listinge

Agent ne vidi:

- Overview
- Agents
- Create Listing
- Locations
- tuđe listinge
- delete listing akciju

Ako agent ručno proba otvoriti tuđi listing preko URL-a, dobija `notFound`.

### Server-Side Zaštita

Ograničenje nije samo UI.

Dodane su server-side provjere:

- `/admin/listings` filtrira listinge po agentu
- `/admin/listings/[id]` provjerava ownership prije prikaza
- `savePropertyAction` dozvoljava agentu update samo za listing koji već pripada tom agentu
- `savePropertyAction` agentu forsira njegov `agentId`, pa ne može prebaciti listing na drugog agenta
- `deletePropertyAction` ostaje admin-only

### Upload Slika

Agent može uploadovati slike za svoje listing editovanje preko existing listing image upload endpointa.

Agent ne može uploadovati agent avatar slike, jer `/api/admin/upload-agent-image` ostaje admin-only.

### Session

Agent session koristi poseban cookie:

- `rise-agent-session`

Cookie je potpisan HMAC potpisom i ne traži novu sessions tabelu.

Main admin session i agent session su odvojeni.

Logout briše oba session cookie-ja.

### Snapshot Zaštita

Popravljeno je da `properties.agent` JSON snapshot nikad ne dobije login podatke.

Listing snapshot čuva samo javne agent informacije:

- ime
- role
- sliku
- kontakt
- capabilities
- public/profile podatke

Ne čuva:

- username
- password hash
- password salt
- login flags

## Storage

`lib/storage.ts` je proširen da upload može primiti opcioni folder, tako da agent slike idu odvojeno od listing slika.

## Dependencies

Dodan je:

- `sharp`

Koristi se za resize/crop agent avatar slike server-side.

## Dokumentacija Dodana U Repo

Dodana su dva dokumenta:

- `docs/app-analysis-and-admin-agents-plan.md`
- `docs/admin-panel-agents-listings-work-summary.md`

Prvi je analiza i plan.

Ovaj dokument je detaljan work summary svega urađenog.

## Glavni Fajlovi Koji Su Mijenjani Ili Dodani

### App Routes

- `app/admin/agents/page.tsx`
- `app/admin/agents/new/page.tsx`
- `app/admin/agents/[id]/page.tsx`
- `app/admin/listings/[id]/page.tsx`
- `app/admin/listings/new/page.tsx`
- `app/api/admin/upload-agent-image/route.ts`
- `app/actions.ts`

### Components

- `components/admin/admin-agents-table.tsx`
- `components/admin/admin-agent-editor.tsx`
- `components/admin/admin-agent-assignment-panel.tsx`
- `components/admin/admin-confirm-dialog.tsx`
- `components/admin/admin-listings-table.tsx`
- `components/admin/admin-property-editor.tsx`
- `components/admin/admin-shell.tsx`
- `components/admin/admin-dashboard.tsx`
- `components/admin/admin-dashboard 2.tsx`

### Data / Lib / Types

- `data/agents.ts`
- `lib/agents-store.ts`
- `lib/properties-store.ts`
- `lib/storage.ts`
- `types/property.ts`

### Package

- `package.json`
- `package-lock.json`

## Verifikacija

Rađene provjere tokom rada:

- `npm run build` prolazi.
- Targeted ESLint za nove/aktivne admin komponente prolazi bez errora.
- Ostali su samo postojeći Next warningi za korištenje `<img>` umjesto `next/image` u admin komponentama.
- Pretraga `window.confirm/window.alert` više ne nalazi native browser potvrde u aplikacijskim folderima.

Napomena: ranije je full `npm run lint` imao pre-existing React hook lint errore u starijim legacy fajlovima koji nisu dio novih agent komponenti. Build prolazi.

## Trenutni Nivo Implementacije

Nivo: funkcionalno implementirano i build-validno.

Ovo je spremno za ručni UX test u admin panelu:

- kreiranje agenta
- upload/crop slike agenta
- edit agenta
- assign listinga agentu
- transfer listinga među agentima
- brisanje agenta bez listinga
- brisanje agenta sa listingima i transferom
- pregled listing table na desktopu
- pregled listing cards na mobile
- provjera agent avatara u listing listi
- provjera custom confirm dijaloga

## Šta Je Namjerno Ostavljeno Sigurno

Nije uveden hard delete listinga prilikom brisanja agenta.

Listing ostaje listing. Mijenja se samo ownership agent.

Nije uklonjen stari `agent` JSON snapshot jer je bitan za kompatibilnost i fallback.

Nije rađen reset ili čišćenje produkcione baze.

Nije rađena agresivna refaktorizacija van admin/agent/listing scope-a.
