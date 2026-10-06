# Architecture

## Status

The initial walking skeleton has evolved into focused, PostgreSQL-backed public-content and private CMS slices. It validates the frontend, API, SSR, feature boundaries, durable read paths, and the first administrator workflows without pre-building later content capabilities.

## Implemented baseline

- `apps/web` is a standalone Angular application using TypeScript, SCSS, server-side rendering, and client hydration.
- `apps/api` is a NestJS REST API with a global `/api` prefix and OpenAPI documentation.
- The public projects read path exposes `GET /api/projects`, optional featured selection through `GET /api/projects?featured=true`, and `GET /api/projects/:slug` through a typed Angular projects data-access boundary. The server-rendered and hydrated home page presents featured projects, while `/projects` navigates to `/projects/:slug` detail routes. Browsers use same-origin `/api`; the server API origin is configured with `API_BASE_URL` and has a local development fallback.
- `GET /api/health` is intentionally deterministic and contains no infrastructure dependency checks.
- The API remains a modular monolith. `ProjectsService` depends only on a projects persistence boundary; its Drizzle implementation reads published projects from PostgreSQL. API DTOs are intentionally separate from Drizzle table and row types.
- Docker Compose provides the local PostgreSQL database. Versioned Drizzle migrations define the schema, and a deterministic development-only seed provides the explicit fake placeholder project.
- Experience is a separate feature with its own publication enum, persistence boundary, public DTO, and SSR `/experience` listing. Its deterministic seed is explicitly fictional and does not represent personal career data. The authenticated CMS can privately list, manually create, review, edit, publish, and move Experience records by UUID. One global administrator-controlled order drives the private list and the filtered Published public subset; creation appends a Draft, while ordering and publication remain independent explicit actions. Status remains the sole public-visibility boundary.
- Education has a separate publication enum and persistence boundary. Public requests expose only Published records through a display-ordered DTO at `GET /api/education`, which the server-rendered home page consumes through a dedicated Angular data-access boundary. The authenticated administrator can privately list, inspect, and edit the content fields of Education records by UUID; status and order remain server-owned and unchanged by that editing boundary. Its deterministic seed is fictional. Education publication, creation, ordering, deletion, and richer fields remain deferred.
- The private CMS uses a single-admin opaque server-session foundation. Password hashes and session-token hashes are stored in PostgreSQL; the browser receives an HttpOnly session cookie. See [ADR 0003](adr/0003-use-opaque-server-sessions-for-single-admin-authentication.md).
- The private CMS supports authenticated listing, manual Project Draft creation, featured-state changes, title/summary/plain-text case-study authoring, explicit publication-status changes, and administrator-controlled adjacent Project ordering. One global Project order drives the authenticated listing and the filtered public and featured subsets; newly created Drafts append to the end, and ordering remains independent of publication and featured state. Project lists stay concise while published Project details may carry the narrative; Markdown, HTML, and rich text remain deferred. Creation always produces an unfeatured Draft; publication remains a separate explicit action. Publication status is the sole public-visibility boundary: drafts and archived projects remain private, while published projects appear only through existing public queries. State-changing private endpoints require a configured trusted `Origin`; the local default is `http://localhost:4200`, while production fails closed unless `TRUSTED_WEB_ORIGIN` is explicitly configured.

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
