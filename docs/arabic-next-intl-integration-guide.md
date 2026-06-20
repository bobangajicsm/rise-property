# Arabic Language Ideas And `next-intl` Integration Plan

Ovaj dokument je pisan za trenutni kod u ovom repo-u.

Relevantni fajlovi trenutno:

- [app/layout.tsx](/Users/vaskrsijepanic/Desktop/Projects/rise-property/app/layout.tsx)
- [app/page.tsx](/Users/vaskrsijepanic/Desktop/Projects/rise-property/app/page.tsx)
- [components/home/nav.tsx](/Users/vaskrsijepanic/Desktop/Projects/rise-property/components/home/nav.tsx)
- [components/home/home-page.tsx](/Users/vaskrsijepanic/Desktop/Projects/rise-property/components/home/home-page.tsx)
- [components/home/hero.tsx](/Users/vaskrsijepanic/Desktop/Projects/rise-property/components/home/hero.tsx)
- [components/listing/property-listing-page.tsx](/Users/vaskrsijepanic/Desktop/Projects/rise-property/components/listing/property-listing-page.tsx)
- [lib/site.ts](/Users/vaskrsijepanic/Desktop/Projects/rise-property/lib/site.ts)
- [lib/properties-store.ts](/Users/vaskrsijepanic/Desktop/Projects/rise-property/lib/properties-store.ts)
- [next.config.ts](/Users/vaskrsijepanic/Desktop/Projects/rise-property/next.config.ts)

## Kratka Preporuka

Da, Arabic bih dodao preko `next-intl`.

Ali ne bih odmah pokušao da baš sve bude potpuno lokalizovano.

Najbolji rollout za ovaj projekat je:

1. prvo lokalizovati cijeli UI
2. zadržati property podatke i slugove kako jesu
3. tek poslije dodati lokalizovane SEO naslove, meta opise i eventualno lokalizovane property fieldove

To je najmanje rizičan put i najbrže daje stvarnu vrijednost.

## Šta Je Trenutno Stanje

Trenutno:

- app nema i18n routing
- root layout je jedan globalni layout
- svi tekstovi su hardcoded po komponentama
- `Arabic` u navbaru je samo `coming soon` dijalog
- property podaci dolaze iz backend/store sloja i nisu lokalizovani po jeziku

To znači da Arabic još nije “spojen” ni na routing ni na stringove.

## Najbolje Ideje Za Arabic Verziju

## 1. Nemoj Sve Prevodi Odmah

Za luxury real estate sajt, najvažnije je da Arabic korisnik odmah razumije:

- navigaciju
- hero poruku
- search i filtere
- CTA dugmad
- kontakt sekciju
- legalne stranice

Ne moraš u prvoj fazi prevoditi:

- property title iz admina
- property description iz admina
- sve SEO kombinacije
- svaki area slug

Prva verzija može biti:

- preveden UI
- isti listing podaci
- isti property slugovi

To je sasvim validan prvi release.

## 2. Arabic Ne Smije Biti Samo Prevod, Nego I RTL

Ako dodaš Arabic, a ne prebaciš layout na RTL, to će djelovati polovično.

Obavezno lokalizovati:

- `dir="rtl"` na `html`
- poravnanje teksta
- redoslijed icon + text kombinacija
- search input i dropdown layout
- navbar spacing
- listing filter panel

Posebno obrati pažnju na:

- hero search
- listing cards
- filter panel
- footer kolone

To su mjesta gdje RTL najbrže “otkrije” loš i18n rollout.

## 3. Search U Arabic Verziji Ne Mora Biti Potpuno Preveden U Backend Smislu

Prva praktična verzija može raditi ovako:

- UI labela i placeholder su na arapskom
- korisnik i dalje može tražiti `The Pearl`, `Lusail`, `West Bay`, `2BHK`
- search engine ostaje isti

To znači:

- backend search logiku ne moraš odmah dirati
- ne moraš odmah uvoditi arapske nazive za svaku lokaciju

Kasnije možeš dodati synonym map:

- `اللؤلؤة` -> `The Pearl`
- `لوسيل` -> `Lusail`
- `الخليج الغربي` -> `West Bay`

Ali to bih radio tek u drugoj fazi.

## 4. Najbolji Arabic Rollout Za Ovaj Repo

Za ovaj projekat bih radio 3 faze.

### Faza 1

- `en` i `ar` locale routing
- preveden navbar
- preveden hero
- preveden footer
- preveden search/filter UI
- prevedene legalne stranice

### Faza 2

- lokalizovan metadata layer
- `hreflang`
- localized sitemap links
- Arabic static content sekcije

### Faza 3

- lokalizovani property fieldovi u adminu
- lokalizovani area nazivi
- synonym search za arapske lokacije
- localized property SEO i localized slugs ako baš bude trebalo

## Kako Bih To Dodao Sa `next-intl`

## Preporučeni Routing Model

Preporučujem:

- English kao default bez prefiksa
- Arabic sa `/ar`

Primjeri:

- `/`
- `/buy`
- `/rent`
- `/search`
- `/properties/my-listing`

Arabic:

- `/ar`
- `/ar/buy`
- `/ar/rent`
- `/ar/search`
- `/ar/properties/my-listing`

Za ovaj projekat to je najbolji balans:

- English URL ostaje čist
- Arabic je jasan i SEO-friendly
- rollout je jednostavniji

## Preporučena Struktura

Dodao bih:

```txt
i18n/
  routing.ts
  request.ts

messages/
  en.json
  ar.json

proxy.ts
```

I onda app prebacio na locale segment:

```txt
app/
  [locale]/
    layout.tsx
    page.tsx
    buy/page.tsx
    rent/page.tsx
    search/page.tsx
    search/[slug]/page.tsx
    properties/[slug]/page.tsx
    privacy-policy/page.tsx
    cookie-policy/page.tsx
    terms-and-conditions/page.tsx
    impressum/page.tsx
```

Admin i API rute bih ostavio van locale segmenta:

```txt
app/admin/...
app/api/...
```

## 1. Instalacija

Dodaj:

```bash
npm install next-intl
```

## 2. `i18n/routing.ts`

Tu bih definisao locale listu:

```ts
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
});
```

Za ovaj sajt je `as-needed` najbolji izbor jer:

- English ostaje bez prefiksa
- Arabic dobije `/ar`

## 3. `i18n/request.ts`

Tu učitavaš messages po locale-u:

```ts
import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  const locale = requestLocale && routing.locales.includes(requestLocale)
    ? requestLocale
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
```

## 4. `next.config.ts`

Root config treba omotati sa `next-intl` pluginom.

Primjer pravca:

```ts
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
```

## 5. `proxy.ts`

Za Next 16 i `next-intl`, idi na `proxy.ts` varijantu, ne na stari `middleware.ts` stil.

Tu bih radio locale routing preko `next-intl/middleware`.

Smjer:

```ts
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)']
};
```

Bitno:

- `api` ostaje van i18n
- `admin` ostaje van i18n
- asset fajlovi ostaju van i18n

## 6. Locale Layout

U [app/layout.tsx](/Users/vaskrsijepanic/Desktop/Projects/rise-property/app/layout.tsx) sada imaš jedan globalni layout.

Ja bih uradio:

- root `app/layout.tsx` ostaje minimalan shell
- pravi UI layout ide u `app/[locale]/layout.tsx`

U locale layout-u:

- setuješ `lang`
- setuješ `dir`
- dodaješ `NextIntlClientProvider`

RTL pravilo:

```ts
const isRTL = locale === 'ar';
```

i onda:

```tsx
<html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
```

## 7. Messages Fajlovi

Dodao bih:

```json
// messages/en.json
{
  "Nav": {
    "services": "Services",
    "about": "About Us",
    "contact": "Contact",
    "arabic": "Arabic"
  }
}
```

```json
// messages/ar.json
{
  "Nav": {
    "services": "الخدمات",
    "about": "من نحن",
    "contact": "تواصل معنا",
    "arabic": "العربية"
  }
}
```

Ne bih pravio jedan ogroman flat file.

Bolje grupisati po sekcijama:

- `Nav`
- `Hero`
- `Search`
- `Listing`
- `Footer`
- `Legal`
- `Contact`

## 8. Zamjena Hardcoded Tekstova

Najviše posla će biti ovdje.

U ovom repo-u bih prvo preveo:

- [components/home/nav.tsx](/Users/vaskrsijepanic/Desktop/Projects/rise-property/components/home/nav.tsx)
- [components/home/hero.tsx](/Users/vaskrsijepanic/Desktop/Projects/rise-property/components/home/hero.tsx)
- [components/listing/property-listing-page.tsx](/Users/vaskrsijepanic/Desktop/Projects/rise-property/components/listing/property-listing-page.tsx)
- [components/home/footer.tsx](/Users/vaskrsijepanic/Desktop/Projects/rise-property/components/home/footer.tsx)
- legal page tekstove

Za client komponente:

```ts
import {useTranslations} from 'next-intl';
```

Za server komponente:

```ts
import {getTranslations} from 'next-intl/server';
```

## 9. Arabic Dugme U Navbaru

Trenutno `Arabic` otvara `coming soon` dijalog u [components/home/nav.tsx](/Users/vaskrsijepanic/Desktop/Projects/rise-property/components/home/nav.tsx).

Kad uvedeš `next-intl`, to dugme treba postati pravi locale switcher.

Najjednostavniji rollout:

- ako si na `/buy`, klik na Arabic vodi na `/ar/buy`
- ako si na `/search?q=the+pearl`, klik na Arabic vodi na `/ar/search?q=the+pearl`

To je bitno da korisnik ne izgubi context.

## 10. Search I Listing Pravilo

Ovo je važno za ovaj sajt:

- UI tekst prevodiš
- query parametre i backend search možeš privremeno ostaviti iste

Primjer:

- placeholder na arapskom
- `Buy` i `Rent` labela na arapskom
- `Bedrooms`, `Bathrooms`, `Parking` na arapskom
- ali query i dalje može biti `The Pearl`

To je potpuno OK za prvu verziju.

## 11. Property Data

Trenutno property model nije multilingual.

Za prvu fazu bih ostavio:

- `property.title`
- `property.description`
- `property.area`
- `property.location`

kako jesu.

Ako kasnije budeš htio puni Arabic CMS/backend model, onda dodaj varijante tipa:

```ts
title: string;
titleAr?: string;
description: string;
descriptionAr?: string;
area: string;
areaAr?: string;
location: string;
locationAr?: string;
```

Ali to je druga faza, ne prva.

## 12. Metadata I SEO

Kad locale routing proradi, onda treba lokalizovati i metadata.

Posebno:

- homepage title/description
- search page title/description
- legal pages
- `alternates.languages`
- sitemap entries za `/ar/...`

Ne bih to radio prije nego osnovni UI proradi.

## 13. Font I Vizuelni Stil Za Arabic

Arabic će odmah djelovati bolje ako imaš i odgovarajući font fallback.

Minimum:

- poseban Arabic font stack
- manje agresivan letter spacing na Arabic
- bolji line-height za Arabic hero i navbar tekst

Ne koristi isti tracking kao za uppercase English labelove.
To u Arabic najčešće izgleda loše.

## 14. Šta Bih Ja Uradio Tačno Sada

Da ja ovo radim u ovom repo-u, išao bih ovim redom:

1. dodati `next-intl`
2. dodati `i18n/routing.ts`, `i18n/request.ts`, `proxy.ts`
3. prebaciti public stranice pod `app/[locale]/...`
4. napraviti `messages/en.json` i `messages/ar.json`
5. zamijeniti hardcoded tekstove u `nav`, `hero`, `listing`, `footer`
6. pretvoriti `Arabic` dugme u pravi locale switcher
7. dodati `dir="rtl"` i RTL utility pravila
8. tek onda lokalizovati metadata i sitemap

## 15. Minimalni MVP Za Arabic

Ako želiš najbrži isporučivi Arabic release, MVP može biti:

- `/ar`
- preveden homepage UI
- preveden search/listing UI
- preveden footer i kontakt
- prevedene legalne stranice
- isti property podaci i isti slugovi

To je dovoljno da Arabic verzija djeluje stvarno korisno.

## Šta Bih Dodao Kao Ideje Poslije `next-intl`

- locale switcher sa `EN / AR` umjesto samo `Arabic`
- automatski `dir` helper utility
- Arabic-only hero copy, ne samo doslovni prevod
- localized contact CTA
- Arabic sitemap page
- Arabic `hreflang`
- Arabic WhatsApp default prefilled poruka
- synonym search za arapske nazive lokacija
- localized admin preview kasnije

## Napomena Za Ovaj Repo

Pošto app ima dosta hardcoded copy-ja po komponentama, najveći posao neće biti routing nego:

- izvlačenje stringova
- RTL poliranje
- testiranje search/listing/filter layouta

Znači:

`next-intl` nije težak dio.
Pravi posao je da Arabic UI izgleda prirodno.

## Official Reference

Koristio bih kao primarne reference:

- `next-intl` App Router docs: https://next-intl.dev/docs/getting-started/app-router
- `next-intl` routing config: https://next-intl.dev/docs/routing/configuration
- `next-intl` navigation docs: https://next-intl.dev/docs/routing/navigation
- Next.js internationalization guide: https://nextjs.org/docs/app/building-your-application/routing/internationalization

