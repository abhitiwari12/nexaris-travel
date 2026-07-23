# Authentication Phase 2

The API implements access tokens, refresh-token rotation, hashed refresh-token persistence, bcrypt password hashing, email verification, forgot/reset password, logout/session revocation, JWT guards, RBAC metadata, permission metadata, and current-user endpoints.

## Endpoints

- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`
- `POST /v1/auth/forgot-password`
- `POST /v1/auth/reset-password`
- `POST /v1/auth/verify-email`
- `GET /v1/auth/me`
- `GET /v1/users/me`
- `PATCH /v1/users/me`
- `PATCH /v1/users/me/avatar`
- `PATCH /v1/users/me/preferences`
- `PATCH /v1/users/me/notifications`
- `POST /v1/users/me/payment-methods`

## Seed

Run `pnpm --filter @nexaris/database seed` after migrations to create roles, permissions, and the first admin user. Override `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in the environment for production bootstrapping.
