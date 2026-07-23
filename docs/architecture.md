# Architecture

Nexaris Travel AI follows Clean Architecture inside a pnpm/Turborepo monorepo. Domain contracts live in `packages/shared`, persistence in `packages/database`, UI primitives in `packages/ui`, environment validation in `packages/config`, the customer/admin experience in `apps/web`, REST orchestration in `apps/api`, and OpenAI-specific planning in `apps/ai-service`.

## Core flows

1. Auth issues short-lived JWTs and hashed refresh tokens.
2. Flight search validates route/date/passenger input before querying provider adapters such as Amadeus.
3. Booking creation owns passenger snapshots, confirmation state, invoice records, and audit logs.
4. Payment modules isolate Stripe/Razorpay intent, verification, webhook, and refund workflows.
5. AI planning stores conversations, structured outputs, and memory for itinerary refinement.
