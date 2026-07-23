# Nexaris Travel AI

Nexaris Travel AI is an enterprise-grade monorepo for AI-powered flight search, travel planning, booking, payments, traveler dashboards, and admin operations.

## Stack

- Turborepo + pnpm workspaces
- Next.js App Router, React, TypeScript, TailwindCSS, shadcn-ready UI package, Framer Motion
- NestJS API with Swagger, validation, JWT-ready auth, RBAC-ready schema, rate limiting, Helmet, and CORS
- PostgreSQL + Prisma, Redis-ready caching, OpenAI service, Amadeus/Stripe/Razorpay integration boundaries
- Docker Compose, Nginx, GitHub Actions, Vitest, Supertest, Playwright-ready structure

## Quick start

```bash
pnpm install
cp .env.example .env
pnpm db:generate
pnpm --filter @nexaris/database seed
pnpm dev
```

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Phase 2 authentication

Authentication now includes register/login/logout, refresh-token rotation, email verification, forgot/reset password, guarded current-user endpoints, profile/preferences/settings APIs, and seed data for roles, permissions, and an admin user. See `docs/auth.md`.

## Phase 3 flight search

Flight search now uses an Amadeus integration with OAuth token caching, retry handling, Redis-backed search cache, provider result mapping, filters, sorting, airport/airline lookup, saved/favorite routes, price tracking, and search analytics. See `docs/flight-search.md`.

## Phase 4 booking engine

Booking now supports authenticated draft creation, passenger details, seat holds, baggage, ancillary services, ticketing, PNR creation, invoice/boarding-pass PDF artifacts, cancellation, and trip retrieval. See `docs/booking-engine.md`.
