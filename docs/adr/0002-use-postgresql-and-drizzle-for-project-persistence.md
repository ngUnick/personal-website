# ADR 0002: Use PostgreSQL and Drizzle for initial project persistence

## Status

Accepted.

## Context

The first projects API slice originally returned a temporary in-memory record. Projects now need durable data while retaining the existing public API contract. The broader product will contain related professional data with publication state, manual ordering, and integrity requirements.

## Decision

Use PostgreSQL as the relational database and Drizzle as the TypeScript data-access and migration library. Use Docker Compose for the local development database. Manage schema changes through committed, versioned migrations; do not use automatic schema synchronization as the normal workflow.

The first schema contains only `projects`: UUID ID, unique slug, title, summary, publication status, featured flag, non-negative display order, and timestamps. A narrow projects persistence boundary reads published projects for the API. API response DTOs remain separate from database schema types.

## Consequences

The project gains durable, constrained, queryable project data and a repeatable local/CI database workflow. Developers must run migrations and a development-only seed before persistence tests. PostgreSQL and Drizzle do not decide future data models: JSONB case studies, technologies, media, CMS editing, authentication, and hosting remain out of scope.
