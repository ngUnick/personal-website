# Development Workflow

## Delivery approach

Develop the product through small vertical slices. Each slice should produce a usable outcome while exercising the relevant frontend, backend, data, and operational concerns when those layers exist.

## Decision making

Document significant, durable architectural decisions as ADRs. A decision should state its context, outcome, and consequences; speculative choices do not need an ADR.

## Quality expectations

Before integrating a change, verify the relevant tests and static checks, review the diff for unintended scope, and confirm the change remains accessible and responsive at the interfaces it affects.

## Local database workflow

The development database is PostgreSQL, started through Docker Compose. Start it with `docker compose up -d`, then apply the committed migrations with `npm run db:migrate --workspace=@personal-website/api`. The deterministic development seed can be run with `npm run db:seed --workspace=@personal-website/api`.

Migrations are versioned source files and are the normal schema-management path. Do not rely on automatic schema synchronization. The seed contains fake data only and refuses to run when `NODE_ENV` is `production`.
