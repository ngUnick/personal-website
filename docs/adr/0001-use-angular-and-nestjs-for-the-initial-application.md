# ADR 0001: Use Angular and NestJS for the initial application

## Status

Accepted

## Context

The project needs a professional, mobile-first personal website with public, server-rendered pages and a small private administration surface in the future. The first implementation must validate a maintainable full-stack shape without prematurely adding persistence, authentication, or deployment infrastructure.

## Decision

Use Angular with TypeScript, SCSS, server-side rendering, and hydration for the web application. Use NestJS for a REST API documented with OpenAPI. Keep both applications in one repository and evolve the API as a modular monolith.

The initial slice uses a feature-oriented projects boundary: the Angular page depends on a typed data-access abstraction, while the NestJS projects feature exposes a small REST response. No shared contracts package is introduced for the first read model.

## Consequences

This provides a concrete SSR-to-API path, a clear transport boundary, generated OpenAPI documentation, and independently testable frontend and backend behavior. It also keeps a future database, content-management capability, and authentication implementation possible without claiming that they already exist.

The tradeoff is two framework toolchains and an API dependency during server rendering. The current SSR configuration therefore uses a server-only `API_BASE_URL` seam with a local fallback, while browsers use same-origin `/api` requests.

## Not decided

Database selection and schema, hosting, authentication/session implementation, object storage, CI/CD, deployment topology, and the public design system remain undecided.
