# Rise Property Plan, Procjena i Trošak

## Svrha

Ovaj dokument je napravljen samo kao plan i procjena.

Trenutno:

- ne radimo implementaciju
- ne diramo postojeći kod funkcionalno
- ne radimo migracije
- samo definišemo šta tačno treba uraditi, koliko realno traje i koliki je trošak po satnici od `$20/h`

## Šta je traženo

Na osnovu PDF-a i screenshotova, traženi scope je zapravo podijeljen na 3 nivoa:

1. Desktop listing/map ispravke
2. Mobile homepage + mobile map/filter flow koji treba vizuelno i UX-om da prati referencu što identičnije
3. Širi V2 scope iz PDF-a: admin dinamika, kontakti, analytics, AI, newsletter, sigurnost, arapska verzija

## Bitna tehnička napomena za bazu i postojeće podatke

Pošto su već dodate nekretnine u bazu, pristup mora biti maksimalno siguran.

To znači:

- postojeće podatke ne smijemo brisati
- modele ne smijemo lomiti rename/drop promjenama u prvom prolazu
- ako trebaju nova polja, raditi samo `extend`, ne destruktivni refactor
- nova polja dodavati additive pristupom
- nove admin/settings stvari radije stavljati u nove tabele nego da se previše dira `properties`
- rollout treba raditi tako da i stari redovi iz baze ostanu validni

U ovom projektu već postoji dobar obrazac za to:

- [lib/properties-store.ts](/Users/vaskrsijepanic/Desktop/Projects/rise-property/lib/properties-store.ts)
- [lib/property-types-store.ts](/Users/vaskrsijepanic/Desktop/Projects/rise-property/lib/property-types-store.ts)
- [lib/featured-areas-store.ts](/Users/vaskrsijepanic/Desktop/Projects/rise-property/lib/featured-areas-store.ts)

Znači, ispravan smjer je:

- `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
- novi pomoćni storage layer
- fallback logika za stare zapise
- bez drop/rename koraka dok sve nije stabilno

## Trenutno stanje projekta ukratko

Već postoji:

- listing page sa search/filter/map logikom
- mobile map mode
- draw-on-map filtering
- property types backend sloj
- featured areas backend sloj
- osnovni admin za listinge
- Zoho lead flow

Nije još gotovo za traženi scope:

- mobile homepage nije kao sa reference
- mobile filter screen nije kao sa reference
- desktop listing UX ima više tačaka iz PDF-a koje treba srediti
- agent management je još statičan
- nema admin contacts inbox
- nema analytics dashboard
- nema 2FA
- nema Arabic version

## Procjena 1: Samo trenutni reference scope

Ovo je najrealniji scope ako sad želiš da se odradi ono što je direktno vezano za screenshotove i PDF Part 1 + Part 2, uz siguran pristup bazi.

### Uključuje

- desktop listing page ispravke iz PDF-a
- sticky map i filter ponašanje
- cleanup listing card/photo overlay elemenata
- map selection glitch debugging
- mobile homepage redesign po referenci
- mobile map + card layout po referenci
- full-screen mobile filter sheet
- histogram + dual range slider
- QA da se ništa ne poremeti u postojećim listing podacima i rutama

### Realna procjena sati

- analiza i precizan UI breakdown: `4-6h`
- desktop listing/map fixes: `12-16h`
- mobile homepage redesign: `8-12h`
- mobile map/results/filter flow: `18-24h`
- data/model safe extension layer ako zatreba: `4-8h`
- QA, bugfix i regression pass: `8-12h`

Ukupno:

- brže, ali i dalje realno: `54h`
- sigurniji raspon: `54-78h`

### Trošak po `$20/h`

- `54h x $20 = $1,080`
- `78h x $20 = $1,560`

Realna radna procjena:

- ako ide fokusirano i bez velikih novih izmjena usput: `7-10 radnih dana`

## Procjena 2: Reference scope + priprema admin/settings foundationa

Ovo je jača verzija gdje se pored reference UI rada odmah postavlja dobar temelj za dalje:

- homepage ordering/control
- osnova za dynamic settings
- priprema za agents/settings/contact modules bez destruktivnih promjena

### Dodatni sati

- settings/data architecture plan: `4-6h`
- additive schema extension + store layer: `8-12h`
- basic admin hooks / save flows: `8-12h`

Dodatak:

- `20-30h`

Ukupno sa prethodnim scope-om:

- `74-108h`

### Trošak po `$20/h`

- `74h x $20 = $1,480`
- `108h x $20 = $2,160`

## Procjena 3: Cijeli PDF V2 scope

Ako pod "to sve" misliš bukvalno cijeli PDF Part 1 + Part 2 + Part 3, onda je to već ozbiljan product pass, ne samo jedan UI task.

### Ovo uključuje

- sve iz reference desktop/mobile scope-a
- dynamic agent management
- dynamic website settings
- dynamic social settings
- homepage property control
- improved listing create/edit flow
- comparison tool
- admin contacts area
- email notifications
- newsletter + Zoho audience/campaign logic
- analytics dashboard
- Google Analytics setup
- AI chat assistant
- Arabic version
- admin 2FA / authenticator

### Realna procjena sati

- reference UI scope: `54-78h`
- dynamic admin/settings/agents: `28-40h`
- contacts + notifications + admin inbox: `18-28h`
- improved listing create/edit flow: `14-22h`
- analytics + GA integration: `12-18h`
- comparison tool: `10-16h`
- AI chat assistant: `18-32h`
- newsletter + Zoho expansion: `18-28h`
- Arabic version: `24-40h`
- 2FA + security hardening: `12-20h`
- final QA/regression/polish: `16-24h`

Ukupno:

- realno: `224-346h`

### Trošak po `$20/h`

- `224h x $20 = $4,480`
- `346h x $20 = $6,920`

Vrijeme trajanja:

- fokusirano solo izvođenje: otprilike `6-10 sedmica`

## Šta bih preporučio kao najbolji redoslijed

Najzdravije je da se ne radi sve odjednom.

### Faza 1

- odraditi reference UI dio
- desktop listing fixes
- mobile homepage
- mobile filter/map/results flow
- regression pass

Procjena:

- `54-78h`
- `$1,080-$1,560`

### Faza 2

- settings foundation
- dynamic agents
- homepage controls
- contacts inbox
- email notifications

Procjena:

- `36-58h`
- `$720-$1,160`

### Faza 3

- analytics
- comparison
- AI chat
- newsletter/Zoho expansion
- Arabic version
- 2FA

Procjena:

- `74-130h`
- `$1,480-$2,600`

## Šta dodatno treba uraditi prije prave implementacije

- potvrditi da mobile reference treba pratiti skoro piksel-identično, a ne samo funkcionalno
- odlučiti koja polja iz filter screen-a stvarno trebaju biti backend polja, a koja mogu ostati UI-only dok nema poslovne potrebe
- provjeriti koja postojeća polja već imaju podaci u bazi, posebno `furnished`, `beds`, `baths`, `type`, `usage`, koordinate i slike
- definisati da li homepage featured ordering treba biti ručni admin control ili automatski
- odlučiti da li V2 admin modules idu odmah ili tek poslije reference UI pass-a

## Rizici koje treba izbjeći

- da se zbog brzine slomi postojeći listing flow
- da se promijene modeli na način koji briše ili invalidira postojeće redove
- da mobile filter uvede nova polja bez fallback logike
- da se map interakcija "zakrpi" vizuelno, a da ostane event glitch u pozadini
- da se Arabic i settings sistemi ubace prerano prije stabilizacije osnovnog UX-a

## Moj realan zaključak

Ako želiš da se sada odradi ono što je direktno na screenshotovima i u prvom dijelu PDF-a, to je potpuno realno u rasponu:

- `54-78h`
- `$1,080-$1,560`

Ako želiš i širi foundation da odmah bude spreman za dalje bez kasnijeg loma baze i modela, računaj:

- `74-108h`
- `$1,480-$2,160`

Ako misliš na kompletan V2 iz PDF-a, onda je to:

- `224-346h`
- `$4,480-$6,920`

Najpametnije bi bilo prvo završiti Fazu 1, jer tu dobijaš najvidljiviji rezultat najbrže, a ujedno najmanje rizikuješ postojeće podatke i trenutni production flow.
