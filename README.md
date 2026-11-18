# TC-Frontend

Seller-facing website for [ticketcricket.co](https://ticketcricket.co), built with Next.js.
Talks to the existing FastAPI backend (unchanged). The admin portal stays in the old
`sport-spectacle-hub` app at `admin.ticketcricket.co`.

See **[PLAN.md](./PLAN.md)** for scope, decisions, route map and progress.

## Stack

- Next.js 16 (App Router, Turbopack, Cache Components) · React 19 · TypeScript
- Tailwind CSS v4 · shadcn/ui (Radix) · Lucide icons
- Fonts: Bricolage Grotesque (headings), DM Sans (body)

> Next.js 16 differs from older versions. Version-matched docs live in
> `node_modules/next/dist/docs/` (see `AGENTS.md`).

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in values
npm run dev                  # http://localhost:3000
```

Run the FastAPI backend locally on port 8000 (or point `API_PROXY_TARGET` at Render).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check (generates Next route types first) |
| `npm test` | Vitest unit tests |

## How API calls work

The browser calls same-origin `/api/*`. `next.config.ts` rewrites that to
`API_PROXY_TARGET`, so the backend's httpOnly auth cookies stay first-party.

## Environment variables

See `.env.example`. `NEXT_PUBLIC_ALLOW_INDEXING=true` and `NEXT_PUBLIC_ENABLE_TRACKING=true`
must be set **only** on production after the domain cutover. Everywhere else the site is
`noindex` and loads no Google/TikTok tracking. `NEXT_PUBLIC_SITE_URL` should be
`https://ticketcricket.co` everywhere (canonical URLs); Google sign-in always returns to the
domain the visitor is on.

## Deploying (Vercel)

New Vercel project → framework Next.js → set env vars → deploy. Cutover steps are in
PLAN.md §7.
