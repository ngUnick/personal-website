# Security

Security will be designed into the application rather than added late. The current provisional technical direction is server-side sessions with secure HttpOnly cookies and no browser-stored JWTs.

Secrets and environment-specific configuration must never be committed. Use local environment files for development and provide only sanitized example files when they are needed.

Security controls will be specified alongside the features and infrastructure that require them; this repository does not yet contain an application runtime or deployment configuration.
