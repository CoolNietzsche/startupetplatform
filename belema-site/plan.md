# Belema General Trading PLC Website — Plan

## Product scope
Build a production-ready English/Amharic website for Belema General Trading PLC and Fine Water using the user-provided brief. Pages: home, Fine Water, import, export, about, quality & certification, contact, privacy draft, terms draft, and a branded not-found page. Global bilingual navigation, accessible contact actions and inquiry forms. Preserve the existing StartupET app and isolate this site under `belema-site/`.

## Implementation
- Next.js App Router 16.4.x, strict TypeScript, React 19, Tailwind CSS 4, next-intl 4, shadcn/ui-patterned accessible primitives, lucide-react; Framer Motion only for restrained progressive reveal and reduced-motion-safe behavior.
- Locales are explicit `/en` and `/am`; messages live in JSON under `content/messages`, site facts and product records are typed JSON/TypeScript under `content/`. Central contact data is `content/site.ts`; copy and product facts are localized and maintainable in Git.
- Server-side inquiry API validates with Zod, verifies Cloudflare Turnstile, rate-limits via Upstash Redis when configured, and delivers email via Resend. Secrets are server-only environment variables. No database or CMS. The endpoint fails closed when required production services are not configured; contact links remain available.
- Static route metadata includes per-locale canonical/alternates, Open Graph metadata, sitemap, robots, and JSON-LD Organization, LocalBusiness, and one Product node per Fine Water size. Security headers are in Next config.
- Use next/image for the custom abstract mountain-and-water hero visual. Do not create product imagery. The brief’s Fine Water logo and ECAE certificate logo were not attachments; use a neutral text wordmark for Belema/Fine Water and source the official ECAE logo unchanged if an official asset can be verified.
- Product-sheet is a one-page downloadable PDF, generated from the same verified facts and clearly marks current-label analysis awaiting verification.
- Playwright smoke coverage covers the localized routes and valid/invalid inquiry-form behavior using test-only service stubs; ESLint and strict `tsc` validate source.

## Project structure
- `app/[locale]/...`: localized App Router pages, shared layout, sitemap/robots and API endpoint.
- `components/`: navigation, hero, cards, forms, footer, language switcher and shadcn-style accessible UI controls.
- `content/`: typed site/contact/product data and English/Amharic messages (Afaan Oromo can be added by adding a locale and message file).
- `lib/`: locale routing, metadata/schema, inquiry validation, Turnstile, rate limit, email and shared helpers.
- `public/`: images, official ECAE asset where sourced, product-sheet PDF, route manifest and static assets.
- `e2e/`: Playwright route/form smoke tests.
- Root docs: README, CONTENT_TODO, handover; `.env.example` contains variable names and safe placeholders only.

## Design system
- **Design movement:** Contemporary Ethiopian corporate editorial, with a restrained premium beverage identity.
- **Core principles:** Trust through clarity; high contrast and open space; concise, bilingual content; mobile-first conversion paths.
- **Color philosophy:** Deep navy (#08457C, #0B2E5E) anchors trust; aqua (#0A9DD1, #7FD0F5) suggests clean water and movement; green (#7AA83A) is a limited accent. White/light canvas keeps labels and data readable.
- **Layout paradigm:** Asymmetric editorial hero with a tall water/mountain visual on one side, full-bleed pale-aqua bands, compact size strip, and staggered information sections instead of centered grids everywhere.
- **Signature elements:** A crisp water-drop outline; thin topographic mountain contours; short aqua wave dividers.
- **Interaction philosophy:** Clear tap targets, persistent navigation, prominent call/WhatsApp routes, low-friction inquiry forms and no surprise motion.
- **Animation:** Optional small opacity/translate reveals only; honor `prefers-reduced-motion`, no autoplay, parallax or scroll-jacking.
- **Typography:** Plus Jakarta Sans for headings, Inter for Latin body text, Noto Sans Ethiopic for Amharic. Large headlines are short; body copy uses comfortable line length and sizing.
- **Brand essence:** A local trading company connecting Fine Water customers and business partners to clear, direct contact. Personality: assured, warm, straightforward.
- **Brand voice:** Concrete and calm; CTAs describe the next action. Examples: “Choose your Fine Water size.” “Talk to us about importing or exporting.”
- **Wordmark & logo:** Do not redraw the requested existing marks. Until official Fine Water/Belema assets are provided, display editable text wordmarks only; show the ECAE logo in its sourced original form if verified. No generated logos.
- **Signature brand color:** Fine Water deep navy `#08457C`.

## Repository and delivery notes
The selected repository already contains an unrelated StartupET product and is public. Work only inside `belema-site/`, on `feat/belema-corporate-site`; do not edit the root app. An official Vercel account is not authorized in this session, and no Resend or Turnstile secrets are configured. Keep source deployable to Vercel, run an externally accessible sandbox preview, and report the exact deployment blockers rather than claiming Vercel publication.