# Belema General Trading PLC website

A bilingual English/Amharic corporate site built on the Next.js App Router. It uses strict TypeScript, Tailwind CSS 4, next-intl, shadcn/ui-style components, lucide-react, reduced-motion-aware Framer Motion, Resend, Cloudflare Turnstile and Upstash rate limiting. There is no database or CMS: content edits go through GitHub.

## Local run and checks

Requirements: Node.js 20.9+ and npm 10.9.2.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000/en` or `/am`. The unprefixed root redirects to `/en`.

```bash
npm run lint
npm run typecheck
npx playwright install chromium
npm run test:e2e
npm run product-sheet
npm run build
```

The Playwright configuration starts an isolated dev server on port 3100 and enables a test-only mock inquiry response. The mock is guarded by `NODE_ENV !== "production"`; it cannot bypass production rate limits, Turnstile or email delivery.

## Edit content in GitHub

- `content/site.ts` is the single source for the company name, domain, phone, mobile, WhatsApp, email, address, ECAE reference and product-sheet path. Phone/email and address should not be duplicated elsewhere.
- `content/products.json` stores the four bottle sizes and supplied label-analysis values.
- `content/messages/en.json` and `content/messages/am.json` store all localized page and UI text.
- `CONTENT_TODO.md` tracks company approvals, unverified product facts, translation review and missing business inputs.

To add a bottle size, add its record to `content/products.json` and add its `uses.<id>` translation in both message catalogs. `SizeCards`, the product JSON-LD and the product sheet input use the same data. Add the translated typical-use wording only after the company approves it; update and regenerate the PDF product sheet.

To add a language such as Afaan Oromo, add its locale to `i18n/routing.ts`, create `content/messages/<locale>.json` with the same key structure as the English catalog, update the language switcher labels and route manifest, then test all 9 routes and localized metadata. Keep the URL prefix and `hreflang` values consistent.

## Production inquiry delivery

The production API **fails closed** and does not claim success until every live service is configured:

1. Add `belemagroup.com` to Resend and verify it. Copy the exact DNS records Resend shows into the domain’s DNS manager. Resend’s domain setup typically asks for DKIM verification and recommends/configures SPF; use the exact host, record type and value Resend provides, avoid duplicate SPF records, then wait for DNS propagation and confirm the domain is verified.
2. Set `RESEND_API_KEY` and a verified `RESEND_FROM_EMAIL`. Inquiries are delivered to `finewater@belemagroup.com`.
3. Create a Cloudflare Turnstile widget for the production host. Set public `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and server-only `TURNSTILE_SECRET_KEY`.
4. Create Upstash Redis REST credentials and set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Production requires shared rate limiting (5 requests per IP per 15 minutes).
5. Set `NEXT_PUBLIC_SITE_URL=https://belemagroup.com`; never commit secret values. Submit a real test inquiry after all services and DNS are verified.

The API uses Zod validation, same-origin browser checks, a honeypot, shared production rate limiting, server-side Turnstile verification, plain-text Resend email, and generic error responses. It does not log personal form content. Without credentials, contact links still work and the form explains that online delivery is not configured.

## Deploy and connect DNS

Import the Next.js project in Vercel from the `belema-site/` directory (or configure it as the project root); set production and preview environment variables separately. Add `belemagroup.com` and, if desired, `www.belemagroup.com` in Vercel’s Domains settings. Copy the exact A/AAAA/CNAME records Vercel lists into the authoritative DNS provider; avoid guessed record values. Wait for Vercel to issue HTTPS, set the canonical origin above, and verify `/robots.txt`, `/sitemap.xml`, redirects and both locales. The current domain returned “Coming Soon” when checked, so DNS ownership and records still need the company’s domain/DNS administrator.

## Analytics and consent

Analytics are disabled by default. To enable one provider, set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` or `NEXT_PUBLIC_GA_ID`; the localized consent banner appears only when analytics is configured, and scripts load only after acceptance. Review the Privacy Policy with counsel and confirm the chosen provider’s terms before turning analytics on. Keep both settings empty to disable analytics and the banner.

## Assets and security

`public/images/fine-water-hero.webp` is the generated abstract water/mountain illustration (194 KB; no product bottle/label is depicted). `public/images/ecae-logo.png` is the sourced ECAE logo and is displayed without recoloring or drawing over it. `next.config.ts` requests AVIF/WebP optimization and applies CSP, HSTS and other security headers. `app/sitemap.ts` and `app/robots.ts` expose crawler files.
