# Personal Website

This repository contains a personal website project built incrementally through small, production-shaped vertical slices.

## Project direction

The website is being designed as a polished, mobile-first professional presence for a Software Engineer. The product will prioritize clear presentation, accessible responsive design, maintainable implementation, and well-justified technical decisions.

## Current implementation

The first walking skeleton is implemented:

- `apps/web`: Angular, TypeScript, SSR/hydration, and SCSS.
- `apps/api`: NestJS REST API with OpenAPI documentation.
- `GET /api/health`: deterministic availability response.
- `GET /api/projects`: one clearly labelled placeholder project, rendered at `/projects` through a typed frontend data-access boundary.

The displayed project is temporary sample content used only to validate the application path; it is not portfolio content.

Projects are now persisted in PostgreSQL through a narrow API-side data-access boundary. The included seed creates only the same clearly fake placeholder record used by the walking skeleton.

## Development

Prerequisites: Node.js 26 or a compatible version supported by the included Angular and NestJS toolchain.

Docker Engine and Docker Compose are required for the local PostgreSQL database.

```sh
npm install
docker compose up -d
npm run db:migrate --workspace=@personal-website/api
npm run db:seed --workspace=@personal-website/api
```

`db:migrate` applies committed schema migrations; it does not synchronize the schema automatically. `db:seed` is deterministic development-only data and refuses to run with `NODE_ENV=production`.

Run the API and web application in separate terminals:

```sh
npm run api:dev
npm run web:dev
```

The API runs on port 3000. The development web server proxies browser `/api` requests to it. Runtime Angular SSR uses `API_BASE_URL` when supplied; otherwise it defaults locally to `http://127.0.0.1:3000/api`. Deployment topology remains undecided.

Useful commands:

```sh
npm test
npm run build
```

Stop the local database with `docker compose down`. Add `-v` only when you intentionally want to remove the local database volume.

OpenAPI documentation is available at `/api/docs` while the API is running.

See [architecture documentation](docs/architecture.md) and [engineering principles](docs/engineering-principles.md) for the current baseline.
