# TC-Frontend — Build Plan

New Next.js frontend for **ticketcricket.co** (seller side only). Replaces the React/Vite
app in `../sport-spectacle-hub` for sellers; that old app keeps running and moves to
`admin.ticketcricket.co` for the admin portal.

Status legend: `[ ]` todo · `[~]` in progress · `[x]` done

---

## 1. Goals & ground rules

- **Why:** SEO (server-rendered pages, real metadata) + the new visual design.
- **Backend unchanged.** Same FastAPI endpoints, same payloads (`../sport-spectacle-hub/backend`).
- **Functionality unchanged.** Same flows, same steps, same validations.
- **No admin.** `/admin`, insights, pricing tools stay in the old app. No admin links here.
- **Design = layout & visuals only.** Source: Claude Design canvas "TicketCricket Website"
  (https://claude.ai/artifact/4SF3NDM63B7iPRGsNjwbry). **All copy comes from the current
  site** (`sport-spectacle-hub/src`). When unsure → follow the current site.
- **Keep every URL path.** Backend emails link to `/active-sales`, `/reset-password`;
  Google Ads final URLs point at current paths; Supabase OAuth returns to `/auth/callback`.
- **Git:** owner creates repo, commits and pushes. Nothing automated here.

## 2. Decisions log

| # | Topic | Decision |
|---|---|---|
| D1 | Trustpilot | Add new Trustpilot badge/link `https://www.trustpilot.com/review/ticketcricket.co` showing **4.5**. Only this new Trustpilot element says 4.5 — existing 4.9 ratings (stats "4.9★ Seller Rating", hero badge, "4.9/5" on sell forms) stay 4.9 as on the current site. |
| D2 | Stats strip | Use the current site's numbers: 50K+ Tickets Purchased · 5 min Average Payout · 0% Seller Fees with PayPal · 4.9★ Seller Rating. No `[X]` placeholders. |
| D3 | Meta description | Keep current wording verbatim ("TicketCricket is a secondary ticket marketplace. Prices are set by sellers and may be above or below face value."). Likely needed for Google Ads ticket-reseller disclosure. Change only with owner OK. |
| D4 | Design-only content | Not on current site → **dropped**: word ticker, category chips, sample reviews, "Why trust us" page, "Reviews" page, Messenger chat widget, design FAQ text, "TicketCricket LLC / ® registered trademark" wording (current site uses ™ and "© TicketCricket. All rights reserved."). |
| D5 | Legacy stub routes | `/offer/:token/{accept,transfer,confirm,payment,complete}` were never wired to the backend (TODO stubs) → not rebuilt; temporary redirect to `/offer/:token`. |
| D6 | Admin | No admin link/route. Admins use `admin.ticketcricket.co`. |
| D7 | Logo | Only `favicon.ico` (16/32px) exists. Header/footer use `public/logo.png` (240px mark from the design canvas, same icon); also `app/apple-icon.png`. Owner to supply SVG or ≥512px PNG + 1200×630 OG image later. |
| D14 | Header CTA | Design has a header CTA; added "Sell Tickets" (current-site wording) next to the current "Sell Season Tickets" and Sign In. Footer category list keeps the current labels without emojis. |
| D8 | Package manager | npm. |
| D9 | Unsupported design features (no backend support) | Dropped: sell-form "Anything else?" notes; payout choice at submit (stays at offer acceptance); decline reasons; "Cancel this order"; editing name/phone/marketing toggle in Settings (read-only); NBA/MLB/NHL season tickets (only NFL data exists); per-row offer timers in Active sales list. Offer page **can** show countdown (`quote.valid_until`). |
| D10 | Nav | Keep current nav: How It Works · News · FAQ · Contact · Blog (external `https://blogs.ticketcricket.co/`) + Sell season tickets + Sell tickets / account menu. |
| D11 | Indexing safety | Site is `noindex` unless `NEXT_PUBLIC_ALLOW_INDEXING=true`. Set it only on production at domain cutover, so the `*.vercel.app` test deployment never competes with the live site in Google. |
| D12 | Tracking safety | GA4 / Google Ads / TikTok load only when `NEXT_PUBLIC_ENABLE_TRACKING=true` (same IDs as current site). Off in dev and on the test deployment so testers don't create fake conversions. On in production at cutover. gclid capture is always on. |
| D13 | gclid cookie on `*.vercel.app` | Old code scoped the cookie to `.vercel.app` (a public suffix → browser rejects it). New code skips the domain attribute there; on `ticketcricket.co` behaviour is unchanged. |

## 3. Stack

- **Next.js 16.4** (App Router, Turbopack, `cacheComponents` + `partialPrefetching` on), React 19, TypeScript.
  Docs for this exact version: `node_modules/next/dist/docs/` (see `AGENTS.md`).
- **Tailwind CSS v4** + **shadcn/ui** (style `radix-nova`, Radix base, Lucide icons; `cn` helper package).
- **Fonts:** Bricolage Grotesque (headings) + DM Sans (body) via `next/font/google`.
- **Data/forms:** TanStack Query, react-hook-form + zod (same as current site) — added in phase 2/5.
- **Auth:** port `useAuth` (client context). `@supabase/supabase-js` only for Google OAuth.
- **API:** `/api/*` → Next rewrite → FastAPI on Render (`API_PROXY_TARGET`). Keeps httpOnly
  auth cookies first-party, same as `vercel.json` in the old app.

### Design tokens (from the design)

| Token | Value | Use |
|---|---|---|
| `cream` / background | `#FFF9F1` | page background |
| `ink` / foreground, primary | `#16131F` | text, primary buttons, footer |
| `brand` | `#2BD47D` | accent: arrow circles, highlights, success |
| `link` | `#047857` | links, accessible green text |
| `line` / border | `#EDE4D6` | borders, dividers |
| `muted-foreground` | `#5F5A6B` | secondary text |
| tints | mint `#DCF7E8` · peach `#FFE5DC` · butter `#FFF1C7` · lilac `#EBE6FF` · sky `#DCEFFF` | cards, badges |
| status | amber text `#8A5A00` · blue text `#0B5C99` · coral `#FF6A45` · yellow `#FFC530` | status pills, timers |
| radius | inputs 14px · cards 20–28px · buttons pill | |
| motion | rise / float / pulse keyframes, all disabled under `prefers-reduced-motion` | |

## 4. Route map

| Route | Current source | Design board | Render | Index |
|---|---|---|---|---|
| `/` | `pages/Index` + `components/landing/*` | Home (+ m-Home) | static | yes |
| `/sell` | `pages/Sell` + `forms/TicketForm` | Sell (+ m-Sell) | static shell + client form | yes |
| `/sell/search` | `pages/SellSearch` | Sell styling | client | no |
| `/sell-season-tickets` | `pages/SellSeasonTicket` + `forms/SeasonTicketForm` + `data/teams.ts` | Season (+ m-Season) | static shell + client form | yes |
| `/thank-you` | `pages/ThankYou` | Thanks | static | no |
| `/how-it-works` | `pages/HowItWorks` | How it works | static | yes |
| `/faq` | `pages/FAQ` | FAQ (UI only; current Q&A) | static | yes (+ FAQPage JSON-LD) |
| `/contact` | `pages/Contact` | Contact | static shell + client form | yes |
| `/news` | `pages/News` + `lib/news.ts` | — (new style) | ISR from backend `/news/espn` | yes |
| `/privacy`, `/terms` | same | — (prose layout) | static | yes |
| `/auth` + `AuthModal` | `pages/Auth`, `auth/AuthModal`, `auth/PhoneVerifyStep` | Signup (+ m-Signup) | client | no |
| `/auth/callback` | `pages/AuthCallback` | — | client | no |
| `/reset-password` | `pages/ResetPassword` | Signup styling | client | no |
| `/active-sales` | `pages/ActiveSales` + `transfer/*` | Portal (+ m-Portal) | client, auth-guarded | no |
| `/sales` | `pages/Sales` | Portal → My sales | client, auth-guarded | no |
| `/settings` | `pages/Settings` | Portal → Settings | client, auth-guarded | no |
| `/offer/:token` | `pages/Offer` + `transfer/OfferPayoutModal` | Portal offer card | client, auth-guarded | no |
| `/offer/:token/*` (5 stubs) | legacy | — | redirect → `/offer/:token` (D5) | — |
| `*` | `pages/NotFound` | 404 | static | no |

## 5. Phases

### Phase 1 — Scaffold `[x]`
- [x] `create-next-app` (TS, Tailwind v4, ESLint, App Router, `src/`, no git)
- [x] shadcn/ui init (Radix base)
- [x] Design tokens in `globals.css`, fonts in root layout, no dark mode (design is light only)
- [x] `next.config.ts`: `/api/*` rewrite, legacy `/offer/:token/*` redirects
- [x] `src/config/site.ts` (name, URLs, phone, Trustpilot, rating, meta description)
- [x] Root metadata (title template, description, OG/Twitter, `metadataBase`), `robots.ts` (D11)
- [x] `.env.example` (+ local `.env.local`), README, favicon from current site
- [x] Placeholder home page to check tokens/fonts
- [x] `lint`, `typecheck`, `build` pass

### Phase 2 — Core port `[x]`
- [x] `lib/api.ts` without admin calls (same request/refresh/session-expiry logic) + typed responses + `submitContact`
- [x] `hooks/useAuth` context (client), lazy Supabase client (`lib/supabase.ts`) for Google OAuth
- [x] Tracking: GA4 page views on route change, Google Ads conversions + enhanced conversions,
      TikTok pixel + events, `gclid` capture (`config/tracking.ts`, `components/analytics/*`, D12)
- [x] Port `data/teams.ts`, `lib/states.ts`, `lib/phone.ts`, `lib/attribution.ts`, `lib/news.ts` (server-safe API base)
- [x] TanStack Query provider, toaster (sonner, `lib/toast.ts` keeps old `toast({title,...})` shape)
- [x] Vitest set up; ported session-refresh + auth-session-expiry tests (14 passing)

### Phase 3 — Shell `[x]`
- [x] Header: current-site nav (How It Works · News · FAQ · Contact · Blog↗), Sell Season Tickets,
      Sell Tickets CTA, Sign In / account dropdown (Active Sales · My Sales · Settings · Log Out), no admin link
- [x] Mobile: account shortcut + menu sheet (closes on link tap)
- [x] Footer: current-site copy & links, secondary-market disclaimer, Trustpilot 4.5 badge (D1)
- [x] 404: design layout, current-site copy ("Ticket Not Found", Go Home, Sell Tickets, path echo)
- [x] Shared: `Container`, `Logo`, `Cta` (pill + arrow), `Eyebrow`, `TintCard`, `StatusPill` (current labels), `TrustpilotBadge`
- [x] `(site)` route group layout (header + main + footer)
- Note: Sign In links to `/auth?redirect=…` until phase 6 swaps in the AuthModal (TODO in header.tsx)

### Phase 4 — Marketing pages + SEO `[x]`
- [x] Home, How it works, FAQ, Contact, Privacy, Terms, News
  - Copy verbatim from the current site; FAQ data in `src/content/faqs.ts`
  - Privacy/Terms: footer opens Termly in a new tab (as today); `/privacy` and `/terms` redirect to Termly (`src/config/legal.ts`)
  - News: public dashboard ported; admin-only AI price outlook + key form left on the admin site (D6)
  - FAQ: design's search + category list; all Q&A rendered in HTML (filtering only hides)
- [x] Per-page metadata + canonical, `sitemap.ts`, Organization + WebSite + FAQPage JSON-LD, OG image (`app/opengraph-image.tsx`, built at build time)

### Phase 5 — Sell flows `[x]`
- [x] `/sell` (findticker search or manual, 2 steps, auth modal on submit), `/sell/search`
  - Event picked on `/sell/search` reaches `/sell` via sessionStorage (`src/lib/sell-handoff.ts`), read once
  - Primary site uses the design's pill buttons (same options + "Add Custom"); native date/time inputs kept
  - Same payloads, toasts, gclid, Google Ads + TikTok conversions, session-expired resubmit
- [x] `/sell-season-tickets`, `/thank-you`
  - Season games still come from `src/data/teams.ts` (NFL 2025, same as the current site)
- `AuthModal` (`src/components/auth/auth-modal.tsx`) is a temporary stub linking to `/auth`; phase 6 fills it in, same props

### Phase 6 — Auth `[x]`
- [x] Auth page + modal: email check → login or signup OTP → phone verify (flagged) · Google
- [x] `/auth/callback`, `/reset-password`, session-expiry handling
  - Header "Sign In" (desktop button, mobile icon, mobile menu) opens the modal, like the current site.
  - `/auth` = design's split card (ink panel reuses the sell sidebar's trust points + review; no new copy),
    Log In / Sign Up tabs, old Auth page copy/toasts. Honours `?redirect=` (same-site paths only).
  - Callback + reset-password are line-for-line ports (Supabase via `getSupabase()`); guarded so the
    one-time code is exchanged once even under React dev double effects.
  - Tests: reset-password-link (7 cases, ported) + safe-redirect.

### Phase 7 — Seller dashboard `[x]`
- [x] Portal layout (sidebar on desktop, tabs on phone)
- [x] Active sales (status, transfer instructions, copy buttons), My sales, Settings (password, payout methods)
- [x] `/offer/:token` (accept/reject, payout modal, countdown from `valid_until`)
  - Orders shown as cards (design) with the same fields/copy as the current tables. Transfer addresses
    unchanged (AXS → nudgeneo@gmail.com, else general@ticketcricket.co).
  - Dashboard + offer pages redirect signed-out visitors to `/auth?redirect=…` (old Settings/Offer had no guard).
  - Settings → Personal Info is read-only (D9): the old "Save Changes" never saved anything.
  - Event dates read as local dates (old pages showed the previous day in US time zones).
  - Header active-link state reads the pathname inside Suspense so `/offer/[token]` can prerender its shell.
  - Tests: `src/test/sales.test.ts`.

### Phase 8 — QA `[x]`
- [x] lint, typecheck, build, tests (28 unit tests; reset-password-link test ported in Phase 6)
- [x] Click-through every flow; 390px mobile pass; Lighthouse SEO/a11y
  - API contract: all 31 frontend endpoints and request bodies match the local backend's OpenAPI.
  - Live, read-only run against the local backend: every public page 200 with no console/page errors
    or failed requests; real event search → 345 real sections → signed-out submit opens auth modal;
    `/auth/check-email` lookup; ESPN news; dashboard/offer guards. All writes were blocked.
  - Signed-in flows (signup/login/OTP, dashboard, payout CRUD, accept/decline offer) re-run on a
    mocked API — writes against a real account need the owner (see below).
  - Lighthouse (mobile, indexing on): SEO 100 and Accessibility 100 on all indexable pages,
    Best Practices 96 (only the anonymous `/auth/me` 401, same as the current site),
    Performance 89–93 (News 81: ESPN data loads in the browser). CLS ≈ 0.
  - axe-core: 0 violations on dashboard, settings tabs, offer page, payout modal, auth modal,
    mobile menu (1440 and 390 px).
  - Fixes: `subtle` grey and the orange-on-peach text raised to WCAG AA contrast; 24px footer/news
    tap targets; `/auth` no longer swaps a skeleton (CLS 0.21 → 0); reserved height on
    `/reset-password` status card; screen-reader `<h1>` on callback / reset-password status screens;
    Google OAuth returns to the current domain (a preview no longer bounces to the live site).
- [ ] Owner, on the Vercel preview with a real account: Google sign-in, email signup (real OTP + SMS),
      submit a ticket, accept/decline an offer from admin, payout methods, password reset email.

## 6. Environment variables

| Var | Example | Notes |
|---|---|---|
| `API_PROXY_TARGET` | `https://ticket-cricket-be.onrender.com` | server-only; `/api/*` is proxied here |
| `NEXT_PUBLIC_API_BASE_URL` | `/api` | keep `/api` so cookies stay first-party |
| `NEXT_PUBLIC_SITE_URL` | `https://ticketcricket.co` | canonical/OG/sitemap URLs — use the production domain on **every** deployment. (Google OAuth returns to the current domain, not this.) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project>.supabase.co` | Google OAuth |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | — | Google OAuth |
| `NEXT_PUBLIC_ALLOW_INDEXING` | `true` only on prod after cutover | D11 |
| `NEXT_PUBLIC_ENABLE_TRACKING` | `true` only on prod after cutover | D12 |

## 7. Cutover checklist (owner)

1. Deploy to Vercel (new project), set env vars above (`NEXT_PUBLIC_ALLOW_INDEXING` unset).
2. Supabase → Auth → URL config: add `https://<vercel-url>/auth/callback`,
   `https://<vercel-url>/reset-password`, the same two paths on `https://ticketcricket.co`, and
   `https://admin.ticketcricket.co` to the redirect allow-list. (`NEXT_PUBLIC_*` values are baked in at
   build time — redeploy after changing them.)
3. Test all flows on the Vercel URL. Backend emails still link to the old frontend during testing.
4. Cutover: point `ticketcricket.co` at new project; old project gets `admin.ticketcricket.co`.
5. Backend env: `FRONTEND_URL=https://ticketcricket.co`; check CORS origins in `backend/src/main.py`.
6. Set `NEXT_PUBLIC_ALLOW_INDEXING=true` and `NEXT_PUBLIC_ENABLE_TRACKING=true` on the new
   production project, redeploy. (To test tracking before cutover, set the tracking flag on
   a preview only and check GA4 DebugView / TikTok Pixel Helper.)
7. Search Console: submit `https://ticketcricket.co/sitemap.xml`.
8. Later (optional): old app redirects non-`/admin` paths to `ticketcricket.co`.
