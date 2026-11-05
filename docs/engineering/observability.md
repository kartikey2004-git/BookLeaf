# Observability baseline

The repository uses structured JSON logs as its baseline. This avoids adding a telemetry vendor before deployment requirements justify one.

## Log schema

API logs are Pino JSON records with `service`, `environment`, request ID, method, URL, status, duration, and sanitized error context. Authorization, cookies, and set-cookie headers are redacted.

Worker logs are JSON records with `service`, `environment`, timestamp, event name, ticket ID where applicable, and outcome. Ticket AI completion, failure, and skipped atomic claims are recorded without ticket content or provider credentials.

## Correlation and health

The API creates and returns an `X-Request-Id`; error responses include the same request ID. Readiness performs a bounded PostgreSQL probe when enabled and returns only a dependency state, not connection details.

## Extension point

Deployment can ship stdout JSON to the platform log collector. Add OpenTelemetry only when a collector, trace retention policy, and alert ownership are selected. Slow-query and connection-pool monitoring remain database-platform responsibilities; raw SQL parameters must never be logged.
