# Zoho CRM + Vercel Production Checklist

Ovaj checklist je za production setup sa domenom:

`https://rise-property.vercel.com`

Koristi ga kad lokalni Zoho flow već radi, a želiš da isto radi i na live sajtu.

## 1. Zoho App Setup

U Zoho API Console napravi ili otvori postojeći:

- `Server-based Application`

Provjeri da su postavljeni:

- `Homepage URL`: `https://rise-property.vercel.com`
- `Authorized Redirect URI`:
  - `https://rise-property.vercel.com/api/zoho/callback`
  - opciono ostavi i lokalni:
  - `http://localhost:3000/api/zoho/callback`

Važno:

- `redirect_uri` mora biti tačno isti kao URI registrovan u Zoho app-u
- možeš imati i lokalni i production redirect URI ako ih dodaš oba u Zoho

## 2. Local Env Za Production Token

Prije generisanja production refresh tokena, u lokalnom `.env.local` privremeno postavi:

```env
NEXT_PUBLIC_SITE_URL=https://rise-property.vercel.com
ZOHO_CLIENT_ID=YOUR_CLIENT_ID
ZOHO_CLIENT_SECRET=YOUR_CLIENT_SECRET
ZOHO_REFRESH_TOKEN=
ZOHO_ACCOUNTS_BASE_URL=https://accounts.zoho.com
ZOHO_API_BASE_URL=https://www.zohoapis.com
```

## 3. Generisanje Production Auth URL-a

Pokreni:

```bash
npm run zoho:auth-url
```

To će ispisati Zoho authorization URL.

Otvori ga u browseru i klikni `Allow`.

## 4. Callback I Code

Nakon odobrenja, Zoho treba da te vrati na:

```text
https://rise-property.vercel.com/api/zoho/callback?code=...
```

Kopiraj vrijednost `code`.

Ako vidiš grešku oko redirect URI-ja:

- provjeri da li je production callback dodat u Zoho app
- provjeri da li je `NEXT_PUBLIC_SITE_URL` tačno `https://rise-property.vercel.com`

## 5. Zamjena Code Za Refresh Token

Pokreni:

```bash
npm run zoho:refresh-token -- TVOJ_CODE
```

Skripta će vratiti `refresh token`.

Ubaci ga u `.env.local`:

```env
ZOHO_REFRESH_TOKEN=YOUR_REFRESH_TOKEN
```

## 6. Vercel Environment Variables

U Vercel Project Settings -> Environment Variables dodaj:

```env
NEXT_PUBLIC_SITE_URL=https://rise-property.vercel.com
ZOHO_CLIENT_ID=YOUR_CLIENT_ID
ZOHO_CLIENT_SECRET=YOUR_CLIENT_SECRET
ZOHO_REFRESH_TOKEN=YOUR_REFRESH_TOKEN
ZOHO_ACCOUNTS_BASE_URL=https://accounts.zoho.com
ZOHO_API_BASE_URL=https://www.zohoapis.com
```

Nakon toga uradi redeploy.

## 7. Šta Sada Radi U Productionu

Kad lead ode iz forme, booking modala ili WhatsApp modala:

- lead ide u Zoho CRM `Leads`
- `Website` field pokušava dobiti direktni property link ako je public URL
- ako property URL nije validan public URL, koristi fallback site URL
- `Description` uvijek sadrži:
  - property title
  - property URL
  - property reference / ID
  - listing details
  - assigned agent
  - source / channel
  - message korisnika

## 8. Production Test

Nakon deploy-a testiraj:

1. običan contact form
2. `Request Details`
3. `Book a Viewing`
4. WhatsApp modal

Za svaki provjeri u Zoho da li se upisuje:

- `Lead Name`
- `Email`
- `Phone`
- `Mobile`
- `Lead Source`
- `Website`
- `Designation`
- `Annual Revenue`
- `Description`

## 9. Najčešći Problem

Ako Zoho vrati:

`INVALID_DATA` za `Website`

to znači da URL koji se šalje nije validan public URL.

Provjeri:

- da `NEXT_PUBLIC_SITE_URL` nije `localhost`
- da property URL koristi pravu domenu
- da Vercel deployment URL stvarno radi

## 10. Preporuka Za Go-Live

Za finalni launch je najbolje da umjesto Vercel preview domene koristiš finalnu custom domenu, pa onda:

- ažuriraš `NEXT_PUBLIC_SITE_URL`
- ažuriraš Zoho redirect URI
- po potrebi regenerišeš refresh token

## Sources

- Zoho OAuth setup: https://www.zoho.com/accounts/protocol/oauth-setup.html
- Zoho authorization flow: https://www.zoho.com/accounts/protocol/oauth/web-apps/authorization.html
- Zoho access token flow: https://www.zoho.com/accounts/protocol/oauth/web-apps/access-token.html
