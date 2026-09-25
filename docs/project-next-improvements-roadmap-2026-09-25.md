# Rise Property - Next Improvements Roadmap

Datum: 2026-09-25

Ovaj dokument biljezi sta jos vrijedi dodati ili ispraviti nakon admin agent/login/listing rada. Fokus je da se sve radi postepeno i bez rizika za produkcijsku bazu.

## Odmah Ispravljeno

- Uklonjen je ruzan placeholder `agent.username`.
- Agent login forma sada koristi placeholder `Enter agent username`.
- Agent editor sada koristi placeholder `Enter agent username`.
- Novo password polje sada koristi `Create agent password` umjesto kratkog `Set password`.

## 1. Mapa: grupisani listing markeri sa brojem

### Problem

Ako vise listinga ima istu ili jako blisku lokaciju, mapa trenutno moze prikazati markere jedan preko drugog. Korisnik ne vidi jasno da tu postoje 2, 3 ili vise listinga.

### Prijedlog

Na mapi prikazati jedan marker sa brojem, npr. `2`, kada vise listinga dijeli istu ili blisku poziciju. Klik na taj broj treba otvoriti popup sa listom tih listinga.

### Kako treba raditi

- Grupisati listinge po koordinatama.
- Ako grupa ima 1 listing, prikazati standardni price marker.
- Ako grupa ima 2+ listinga, prikazati count marker.
- Klik na count marker otvara popup.
- Popup treba prikazati kompaktan spisak:
  - slika
  - naslov
  - cijena
  - lokacija/area
  - dugme ili link `View Details`

### Fajlovi

- `components/maps/property-listing-map.tsx`
- `components/maps/area-properties-map.tsx`
- `components/maps/leaflet-markers.ts`

### Napomena

U projektu vec postoji `react-leaflet-cluster`, pa se moze koristiti za pravo clustering ponasanje. Ako zelis bas tacno ponasanje za iste koordinate, moze se uraditi i custom grouping bez nove biblioteke.

## 2. Homepage swiper za property cards

### Problem

Homepage trenutno ima recommended properties grid na desktopu i horizontal scroll na mobilnom. To radi, ali moze biti elegantnije i jasnije sa kontrolama lijevo/desno.

### Prijedlog

Dodati swiper/slider za recommended properties na pocetnoj:

- strelice lijevo/desno
- progress indikacija ili male tačke
- drag/swipe support
- lijep mobile i desktop layout
- bez previse teksta

### Fajlovi

- `components/home/recommended-properties.tsx`
- eventualno nova komponenta `components/home/property-swiper.tsx`

### Napomena

Ako zelimo bez dodatnih dependency-ja, moze se napraviti native scroll carousel sa dugmicima. Ako zelimo puni Swiper, dodati `swiper` package.

## 3. Agent/admin profil i login polish

### Sta jos vrijedi dodati

- Posebna `/admin/profile` stranica.
- Za admina prikazati email i role.
- Za agenta prikazati avatar, ime, role, username i broj dodijeljenih listinga.
- Dodati `last_login_at` opciono polje za agente.
- Dodati `password_updated_at` opciono polje za agente.

### DB pravilo

Sva nova polja moraju biti opciona i dodana kroz `ADD COLUMN IF NOT EXISTS`.

## 4. Admin listing UX

### Sta jos vrijedi dodati

- Instant remove agenta iz listing table avatar stacka.
- Undo feedback nakon dodavanja/uklanjanja agenta.
- Filter po agentima u listing tabeli.
- Saved view za kolone koje admin izabere.
- Bulk assign/remove vise agenata iz listing table.

### Fajlovi

- `components/admin/admin-listings-table.tsx`
- `components/admin/admin-property-editor.tsx`
- `lib/properties-store.ts`
- `app/actions.ts`

## 5. Kvalitet podataka

### Sta provjeriti

- Listing bez validnih koordinata.
- Listing bez slike.
- Listing sa duplim slugom ili losim naslovom.
- Listing sa previsokom/niskom cijenom zbog greske u unosu.
- Listing kojem je agent deaktiviran, a i dalje je primary.

### Prijedlog

Dodati admin health panel:

- `Missing Images`
- `Missing Coordinates`
- `Inactive Agent Assigned`
- `Drafts Older Than 30 Days`

## 6. Performance i clean up

### Primijeceno

Postoje dupli/stari fajlovi koji izgledaju kao backup:

- `components/admin/admin-dashboard 2.tsx`
- `lib/storage 2.ts`
- `app/privacy-policy/page 2.tsx`
- `app/terms-and-conditions/page 2.tsx`

### Prijedlog

Provjeriti da li se koriste. Ako se ne koriste, ukloniti ih u posebnom cleanup koraku.

### Slike

ESLint upozorava na vise `<img>` elemenata. To nije breaking problem, ali za bolji performance treba postepeno prebaciti javne slike na `next/image`, posebno:

- listing kartice
- login hero
- admin agent avatari
- property detail galerije

## 7. Testovi koje treba dodati

### Admin

- Admin login radi.
- Admin moze dodati agenta na listing.
- Admin moze ukloniti agenta sa listinga.
- Listing ne moze ostati bez agenta.
- Agent transfer radi kod brisanja agenta.

### Agent

- Agent login radi.
- Agent vidi samo svoje listinge.
- Agent ne moze otvoriti tudji listing.
- Agent ne vidi admin-only navigaciju.
- Agent ne moze brisati listing.

### Public

- Search/listing mapa prikazuje grouped marker.
- Klik na grouped marker otvara popup listu.
- Homepage swiper radi na mobile i desktop.

## Prioritet

1. Map grouped marker sa brojem i popup listom.
2. Homepage property swiper.
3. Listing table filter po agentima.
4. Admin/profile stranica.
5. Cleanup duplih fajlova.
6. `next/image` performance pass.
7. Playwright smoke testovi.
