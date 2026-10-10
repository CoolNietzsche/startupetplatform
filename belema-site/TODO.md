# Website outcomes and acceptance checks

## Implemented in source
- [x] Bilingual English/Amharic site with locale-prefixed routes for Home, Fine Water, Import, Export, About, Quality & Certification, Contact, Privacy and Terms.
- [x] Supplied contact details, four bottle sizes, tagline, exact storage wording, label-analysis table and license wording; unsupported label/license claims are qualified.
- [x] Import workflow, export inquiry content, about mission/values as clearly marked draft copy, and an explicit leadership placeholder.
- [x] Contact links (call, WhatsApp, email and Telegram share intent), OpenStreetMap regional embed, general/product/trade forms, product-sheet download slot and 404.
- [x] Sticky responsive header/footer, language switcher, floating WhatsApp CTA, skip link, keyboard focus, reduced motion and light theme.
- [x] Next.js 16 App Router, strict TypeScript, Tailwind CSS 4, next-intl, shadcn/ui-style controls, lucide-react and one Framer Motion reveal.
- [x] Zod form validation, same-origin check, honeypot, Cloudflare Turnstile, Upstash shared rate limiting and Resend server-side integration; secrets only in env files.
- [x] Production API fails closed if required services are not configured.
- [x] JSON-LD Organization/LocalBusiness/Product data, page metadata, canonical/hreflang, sitemap and robots rules.
- [x] `next/image`, AVIF/WebP output, 194 KB abstract hero art, exact ECAE source logo, security headers and optional consent-gated analytics.
- [x] `.env.example`, local setup, test/build commands, content-editing, size/language addition, consent and DNS/email setup documented.
- [x] `CONTENT_TODO.md` records missing company inputs, source checks and review assumptions.

## Must be verified before public launch
- [x] ESLint and strict TypeScript pass. The temporary public preview returned HTTP 200; English desktop and Amharic mobile screenshots were captured.
- [ ] Run Playwright on all 18 localized routes and four form variants, complete a production build, and record results. Deferred at your request.
- [ ] Check visual/mobile layout, page weight, keyboard access and Lighthouse scores. Target mobile score >=90 in Performance/Accessibility/Best Practices/SEO, LCP under 2.5s on throttled 4G, and under 1 MB/page; publish only actual measured results.
- [x] Generate and inspect a one-page A4 bilingual product-sheet PDF (77,180 bytes). Its chemistry values remain explicitly unverified.
- [ ] Obtain company confirmation of the draft mission/values and generic typical-use copy; obtain Amharic native-speaker review.
- [ ] Obtain latest lab report and current license scope/date before confirming any chemistry/certification claim.
- [ ] Confirm Telegram handle. Current Telegram CTA opens a share sheet because no company username was provided; it does not target a Belema support account.
- [ ] Add verified Resend/Turnstile/Upstash settings, complete DNS verification, and test live email delivery.
- [ ] Obtain domain administrator confirmation for authoritative DNS records and connect the domain in Vercel.
- [ ] Have Ethiopian counsel complete and approve Privacy Policy and Terms.
- [ ] Attach or supply approved Belema/Fine Water logo and product images if available; until then use the text wordmark and abstract-only hero.
