# ADR 0003: Use opaque server sessions for single-admin authentication

## Status

Accepted.

## Context

The private CMS needs one administrator. Browser-stored JWTs would make token exposure and revocation harder to control, while a multi-user identity system is not a current requirement.

## Decision

The API verifies passwords with Node's `scrypt` construction. Successful login issues a random opaque token, stores only its SHA-256 hash with an expiry in PostgreSQL, and sends the raw token solely in an HttpOnly cookie with `SameSite=Lax`, `Path=/`, explicit lifetime, and `Secure` in production. Logout deletes the matching server-side session.

The application has no registration, role model, external identity provider, or browser-stored JWT. The API is the authoritative authentication boundary. The initial `/admin` UI is intentionally only an authenticated CMS placeholder.

## Consequences

Server-side sessions can be revoked and expired centrally, but require PostgreSQL for authenticated requests. The first authenticated write uses a reusable trusted-origin guard: browser-facing mutations require an `Origin` matching `TRUSTED_WEB_ORIGIN`, whose local development default is the Angular development origin. Final deployment must configure the web/API origin consistently.
