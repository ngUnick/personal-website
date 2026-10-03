# Architecture

## Status

The initial walking skeleton now includes a narrow PostgreSQL persistence slice for projects. It validates the frontend, API, SSR, feature boundary, and durable projects read path without introducing administration concerns.

## Implemented baseline

- `apps/web` is a standalone Angular application using TypeScript, SCSS, server-side rendering, and client hydration.
- `apps/api` is a NestJS REST API with a global `/api` prefix and OpenAPI documentation.
- The first vertical slice is `GET /api/projects` → typed Angular projects data-access boundary → runtime server-rendered and hydrated `/projects` route. Browsers use same-origin `/api`; the server API origin is configured with `API_BASE_URL` and has a local development fallback.
- `GET /api/health` is intentionally deterministic and contains no infrastructure dependency checks.
- The API remains a modular monolith. `ProjectsService` depends only on a projects persistence boundary; its Drizzle implementation reads published projects from PostgreSQL. API DTOs are intentionally separate from Drizzle table and row types.
- Docker Compose provides the local PostgreSQL database. Versioned Drizzle migrations define the schema, and a deterministic development-only seed provides the explicit fake placeholder project.

## Accepted constraints

- Build incrementally through walking skeletons and vertical slices rather than completing the frontend before backend work begins.
- Organize implementation by feature where practical.
- Design for accessibility, responsiveness, security, maintainability, and testability from the outset.
- Keep the private administration experience intentionally single-administrator; do not introduce a multi-user role system without a real requirement.
- Keep the architecture open to a future blog without building a blogging product before there is content.

## Provisional technical direction

Angular SSR/hydration, SCSS, NestJS REST, OpenAPI, and the modular-monolith direction are now validated by the first walking skeleton. See [ADR 0001](adr/0001-use-angular-and-nestjs-for-the-initial-application.md).

PostgreSQL with Drizzle is implemented for the initial projects read path; see [ADR 0002](adr/0002-use-postgresql-and-drizzle-for-project-persistence.md). Object storage for media, server-side sessions secured by HttpOnly cookies, CD, hosting, and the remainder of the public and administration experiences remain provisional and unimplemented.

## Deliberately out of scope for now

Microservices, Kubernetes, Redis, Kafka, RabbitMQ, GraphQL, PWA capabilities, AI features, self-hosted video, and unnecessary multi-user administration are not current requirements.
