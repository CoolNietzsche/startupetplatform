# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

StartupET — a Next.js 15 / React 18 / TypeScript platform for the Ethiopian Ministry of Innovation & Technology, handling startup certification and ecosystem mapping.

## Package manager

Use **pnpm**, not npm — despite `package-lock.json` also being present in the repo, pnpm is the canonical package manager here.

## Commands

- `pnpm dev` — dev server (`next dev --turbo`)
- `pnpm dev:full` — regenerates Prisma client, seeds the DB, then starts dev server
- `pnpm build` / `pnpm start` — production build/start
- `pnpm lint` — `next lint`
- `pnpm test:e2e` — Playwright e2e (single spec: `e2e/smoke.spec.ts`; auto-starts dev server on port 3000)
- `pnpm db:generate` / `pnpm db:push` / `pnpm db:seed` / `pnpm db:studio` — Prisma commands

There is no `npm test` script. To run the hand-rolled verification tests in `tests/`, use `tsx tests/integration/run-all.ts`.

## Prisma gotcha

The schema lives at `prisma/schema/` (a directory of `.prisma` files), not the default `prisma/schema.prisma`. All `pnpm db:*` scripts already pass `--schema prisma/schema`, but if invoking `prisma` directly, that flag must be included or the command will fail to find the schema.

## Code style

`@typescript-eslint/no-explicit-any` is explicitly turned off in `.eslintrc.json` — `any` is allowed here, unlike typical strict Next.js/TypeScript setups.

## Repo notes

- `.github/workflows/deploy.yml` is dead boilerplate (yarn build/export, chakra-nextjs-pro, gh-pages) left over from a template — it does not reflect this project's actual deployment and can be ignored.
- The repo root has accumulated backup/scratch artifacts (`.env.bak-*`, `docker-compose.yml.bak-*`, log/audit files, ad-hoc scripts) that are not part of the application — don't treat them as project structure.
