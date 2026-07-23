FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages packages
RUN pnpm install --frozen-lockfile=false
FROM deps AS build
COPY apps apps
RUN pnpm --filter @nexaris/web build
CMD ["pnpm", "--filter", "@nexaris/web", "dev"]
