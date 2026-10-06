# Testing Strategy

Testing follows the application as it is introduced. Each vertical slice should have tests proportionate to its risk and behavior, with a preference for fast feedback at the smallest useful scope.

## Current baseline

- Nest endpoint tests exercise the real application module and verify health plus public persisted-content responses.
- Focused Drizzle persistence tests verify published-only filtering, ordering, and public projections for each implemented PostgreSQL-backed feature.
- Angular tests verify HTTP data-access adapters' requested endpoints and home/page rendering through substituted data-access boundaries.
- Production builds are required for both applications.
- Runtime smoke checks validate the API, OpenAPI surface, and raw server-rendered public HTML, including persisted content on the home page.

Run the automated suites with `npm test`; build both applications with `npm run build`. Before API persistence tests, start PostgreSQL and apply the committed migrations and development seed.

Accessibility, browser-level end-to-end, performance, and broader integration coverage will be added when their corresponding user journeys and risks exist.
