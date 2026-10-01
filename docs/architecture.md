# Architecture

## Status

The initial walking skeleton is implemented. It validates the chosen frontend, API, SSR, and feature-boundary shape without introducing persistence or administration concerns.

## Implemented baseline

- `apps/web` is a standalone Angular application using TypeScript, SCSS, server-side rendering, and client hydration.
- `apps/api` is a NestJS REST API with a global `/api` prefix and OpenAPI documentation.
- The first vertical slice is `GET /api/projects` → typed Angular projects data-access boundary → runtime server-rendered and hydrated `/projects` route. Browsers use same-origin `/api`; the server API origin is configured with `API_BASE_URL` and has a local development fallback.
- `GET /api/health` is intentionally deterministic and contains no infrastructure dependency checks.
- The API remains a modular monolith. The projects service currently owns one explicit in-memory placeholder record; it has no repository or persistence abstraction yet.

## Accepted constraints

- Build incrementally through walking skeletons and vertical slices rather than completing the frontend before backend work begins.
- Organize implementation by feature where practical.
- Design for accessibility, responsiveness, security, maintainability, and testability from the outset.
- Keep the private administration experience intentionally single-administrator; do not introduce a multi-user role system without a real requirement.
- Keep the architecture open to a future blog without building a blogging product before there is content.

## Provisional technical direction

Angular SSR/hydration, SCSS, NestJS REST, OpenAPI, and the modular-monolith direction are now validated by the first walking skeleton. See [ADR 0001](adr/0001-use-angular-and-nestjs-for-the-initial-application.md).

PostgreSQL, object storage for media, server-side sessions secured by HttpOnly cookies, CI/CD, hosting, and the remainder of the public and administration experiences remain provisional and unimplemented.

## Deliberately out of scope for now

Microservices, Kubernetes, Redis, Kafka, RabbitMQ, GraphQL, PWA capabilities, AI features, self-hosted video, and unnecessary multi-user administration are not current requirements.
