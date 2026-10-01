# Architecture

## Status

The application architecture has not been implemented. The decisions below distinguish accepted product constraints from provisional technical direction.

## Accepted constraints

- Build incrementally through walking skeletons and vertical slices rather than completing the frontend before backend work begins.
- Organize implementation by feature where practical.
- Design for accessibility, responsiveness, security, maintainability, and testability from the outset.
- Keep the private administration experience intentionally single-administrator; do not introduce a multi-user role system without a real requirement.
- Keep the architecture open to a future blog without building a blogging product before there is content.

## Provisional technical direction

The present leading option is an Angular and TypeScript frontend with SSR/hydration and SCSS, paired with a Node.js and NestJS REST API documented through OpenAPI. The expected shape is a modular monolith with PostgreSQL, object storage for media, and server-side sessions secured by HttpOnly cookies.

These are not implementation commitments. They will be validated through ADRs when application work begins.

## Deliberately out of scope for now

Microservices, Kubernetes, Redis, Kafka, RabbitMQ, GraphQL, PWA capabilities, AI features, self-hosted video, and unnecessary multi-user administration are not current requirements.
