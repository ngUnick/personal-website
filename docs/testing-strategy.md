# Testing Strategy

Testing follows the application as it is introduced. Each vertical slice should have tests proportionate to its risk and behavior, with a preference for fast feedback at the smallest useful scope.

## Current baseline

- Nest endpoint tests exercise the real application module and verify the health and placeholder-project responses.
- Angular tests verify the HTTP data-access adapter's requested endpoint and the projects page's rendering through a substituted data-access boundary.
- Production builds are required for both applications.
- Runtime smoke checks validate the API, OpenAPI surface, and raw server-rendered `/projects` HTML.

Run the automated suites with `npm test`; build both applications with `npm run build`.

Accessibility, browser-level end-to-end, performance, and broader integration coverage will be added when their corresponding user journeys and risks exist.
