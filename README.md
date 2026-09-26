# Козацький Стан — k-stan.vn.ua

New website for the Kozatskyi Stan hotel, restaurant and wood-fired sauna in the forest near Vinnytsia. It replaces the old WordPress site.

- **Ukrainian** at `/` and **English** at `/en`, with localized URLs such as `/gotel/` ↔ `/en/hotel/`.
- Online **room booking requests** (checked against availability), **table reservations** and **banquet inquiries**. Staff get a Telegram message and an email, and the guest gets a confirmation email.
- Local SEO: canonical and hreflang tags, a sitemap, JSON-LD (`LocalBusiness` → `Hotel` + `Restaurant`, `HotelRoom`, `FAQPage`, `BreadcrumbList`) and 301/308 redirects for every old URL.
- The database is designed as the base for the future staff tool (`/admin`, phase 2).

**Stack:** Next.js 16 (App Router, Server Actions), Tailwind CSS v4, next-intl, Postgres + Drizzle ORM, zod. Tests use Vitest and Playwright.

## Quick start

```bash
pnpm install
cp .env.example .env.local           # then fill in DATABASE_URL at least

# Postgres 16 locally (any way you like), e.g.:
createuser -P kstan && createdb -O kstan kstan

pnpm db:migrate                       # apply drizzle/*.sql
pnpm db:seed                          # room types from content/rooms.ts (safe to re-run)
pnpm dev                              # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `pnpm lint` / `pnpm typecheck` | ESLint / TypeScript |
| `pnpm test` | Unit tests (availability, validators, anti-spam) |
| `pnpm build && pnpm test:e2e` | Playwright against a production build + real DB (both locales, desktop + mobile) |
| `pnpm db:generate --name <x>` | New migration after editing `src/lib/db/schema.ts` |
| `pnpm images:import` | Re-download the real photos from k-stan.vn.ua and hotels3d.com into `public/images/` |
| `pnpm images:placeholders` | Regenerate illustrated stand-ins for photos that don't exist yet |
| `pnpm brand` | Rebuild the logo SVG, round badge, favicon and app icons from `scripts/brand/` (the SVG trace needs `potrace`) |

For e2e with a preinstalled Chromium, set `CHROMIUM_PATH=/path/to/chrome`.

## Where things live

```
content/          ← all business copy, in uk + en. Edit here, not in components.
  business.ts       name, address, phones, geo, hours: the single source of truth for NAP + JSON-LD
  rooms.ts          room types (also seeds the room_types table)
  venues.ts         halls / houses / gazebos, sauna prices
  menu.ts           full priced menu (generated from the live ChoiceQR menu, 92 items)
  faq.ts, images.ts
messages/         UI strings (uk.json, en.json)
src/app/[locale]/ pages; uk slugs match the old WordPress URLs
src/lib/booking/  validation (zod), availability, server actions, anti-spam, ref codes
src/lib/db/       Drizzle schema + client        drizzle/  SQL migrations
src/lib/notify/   Telegram + Resend (log to console when not configured)
src/lib/seo/      metadata (canonical/hreflang/OG), JSON-LD builders
src/proxy.ts      locale routing + 410 Gone for the old /vitannya/ spam
```

## How bookings work

1. The form posts to a server action. It checks the honeypot, the minimum fill time (3 s), the per-IP rate limit (5 per 10 min) and, optionally, Turnstile, then validates with zod: UA phone numbers are normalized to `+380…`, dates are checked in Kyiv time, and guests must fit the room's capacity.
2. **Hotel:** inside a transaction that holds a per-room-type advisory lock, the action counts the `pending` and `confirmed` bookings on **each night** of `[check_in, check_out)` and compares that with `units_count`. The check-out day stays free. If the dates are full, the form tells the guest and suggests calling.
3. The row is inserted as `pending` with a ref code such as `H-7KQ2XM` (`T-` for tables, `E-` for events). The guest is redirected to the thank-you page with the ref.
4. After the response is sent, staff are notified by Telegram and email, and the guest gets an email if they gave an address. Staff confirm by phone. There is no online payment.

Table reservations and banquet inquiries follow the same steps without the availability check. Table times must fall within the restaurant hours, with the last seating one hour before closing.

## Deploying (Vercel + Neon/Supabase)

1. Create a Postgres database (Neon or Supabase) and use its **pooled** connection string as `DATABASE_URL`. The client already sets `prepare: false` for PgBouncer.
2. Run `pnpm db:migrate && pnpm db:seed` against it once, then after every schema change.
3. Import the repo in Vercel and set the variables from `.env.example`:
   - `SITE_URL=https://k-stan.vn.ua`
   - `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`: create a bot with @BotFather, add it to the staff group, and read the chat id from `getUpdates`.
   - `RESEND_API_KEY` + `NOTIFY_EMAIL` + `EMAIL_FROM`: verify `k-stan.vn.ua` in Resend first.
   - Optional: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` turn on the Cloudflare Turnstile check.
4. Point `k-stan.vn.ua` at Vercel. The domain is behind Cloudflare today, so either set it to DNS-only or follow Vercel's Cloudflare guide.
5. After launch, submit `https://k-stan.vn.ua/sitemap.xml` in Google Search Console. The existing verification files (`public/google*.html`) are kept.

## Confirm with the owner before launch

These came from the old site, the live ChoiceQR menu and hotels3d.com. Please check them with staff. They are also marked `CONFIRM` in the code.

- [ ] **Standard room count** (`unitsCount` in `content/rooms.ts`, currently 8). Availability depends on it.
- [ ] **Prices.** The old site says 250 грн per night for standard rooms and hotels3d.com says "від 300 грн"; the site shows "від 300 грн". The houses are 1000 (+200 for the sauna) / 600 / 400 грн, and the sauna is 180 грн/h (+20 грн per person over 6).
- [ ] **House numbering.** The 600 грн house is №17 on the old site and "VIP №18" on hotels3d.com; the site uses №18.
- [ ] **Full postal address.** The old site only says "Вінницька об'їзна", and 23222 comes from ChoiceQR.
- [ ] **Telegram** for guests (`business.social.telegram`) and a public contact **email**.
- [ ] Banquet hall capacity: the old pages say both 100 and 130; the site uses 130.
- [ ] Menu prices are from ChoiceQR as of 2026-09-26. Keep `content/menu.ts` in sync, or re-generate it.
- [ ] Review the privacy policy text (`/polityka-konfidentsiynosti/`).

## Photos

`content/images.ts` is the manifest. The real photos in use are:

- 6 full-HD exteriors from the old homepage, plus the banquet hall and a gazebo scene from inner pages.
- 4 sauna photos (pool, steam room, pool with ladder, rest room) from the Instagram post instagram.com/p/Bb7CEptFTN3, cropped to remove Instagram's arrows and dots.
- 4 small (400×200) room views from hotels3d.com (standard, VIP №18, VIP №22) and the tavern exterior.

**Still needed:** food and the small VIP houses, which show illustrated placeholders (`placeholder: true`), plus full-resolution room interiors. The room previews are low-res because the full 360° panoramas are hosted on `3d-tours.com.ua`, so ask the owner or their photographer for the originals. Drop a WebP of at least 1600 px with the same file name into `public/images/`, update the width and height, and set `placeholder: false`.

## Logo

`scripts/brand/` holds both real sources: the old site's transparent logo (`Logo_KozStan_2017.png`, 200×153) and the round parchment badge from Instagram. `pnpm brand` builds everything from them:

- `public/brand/logo.svg`: a vector trace of the fortress-and-ribbon logo, used in the header.
- `public/brand/logo-badge.png`: the round badge, used in the footer and the social preview image.
- `public/logo.png`: the logo Google uses (JSON-LD).
- `src/app/icon.png` and `src/app/apple-icon.png`: the browser tab and phone home-screen icons.

If the owner has the original vector logo (SVG, AI, EPS or PDF from the designer), save it as `public/brand/logo.svg` and run `pnpm brand --no-trace`.

## Off-site SEO checklist for the owner

Keep the name, address and phone exactly the same everywhere as in `content/business.ts`:

- [ ] **Google Business Profile**: category *Hotel* plus secondary *Restaurant* and *Banquet hall*, hours, the booking link `https://k-stan.vn.ua/bronyuvannya/`, the menu link, and new photos. Ask happy guests for reviews.
- [ ] **Google Search Console**: submit the sitemap and watch the old URLs redirect cleanly.
- [ ] **Bing Webmaster Tools** (imports from Search Console).
- [ ] Update the listings on **map.vn.ua**, **dovidka.com**, **top20.ua**, **hotels3d.com**, and in Instagram and the ChoiceQR profile, all with a link to the new site.

## Security note about the old site

The old WordPress install serves dozens of unrelated "greeting" articles under `/vitannya/`. They are not in its sitemap, which is typical of **injected SEO spam**, so the install is probably compromised. None of the old code, plugins or database were carried over. The new site answers `410 Gone` for `/vitannya/*` so search engines drop those pages. When the old hosting is shut down, don't reuse its database or `wp-content`, and change any passwords that were used there.

## Phase 2: staff tool (not built yet)

`/admin` will use the same tables:

- Auth.js login for staff
- calendar and occupancy view
- confirm or cancel bookings, with an automatic guest notification
- manual entry for phone bookings
- room assignment (a new `rooms` table)
- daily table plan
- CSV export

Optional later: online prepayment (LiqPay, WayForPay or Monobank) and a Booking.com iCal sync.
