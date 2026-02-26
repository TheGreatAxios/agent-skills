# Ops: Rollout And Observability

## Rollout model
- Stage 1: `DRY_RUN` global.
- Stage 2: per-rule `LIVE` on high-confidence controls.
- Stage 3: full enforcement with dashboards and runbooks.

## What to monitor
- Deny rates by rule and endpoint.
- False positives from support tickets and replay checks.
- Latency impact by runtime.

## Links
- https://docs.arcjet.com/blueprints/sampling/
- https://docs.arcjet.com/shield/quick-start/
- https://docs.arcjet.com/rate-limiting/quick-start/
