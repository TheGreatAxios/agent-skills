# Failure Modes: Fail Open vs Fail Closed

## Default operational posture
- Start fail-open during onboarding to prevent availability regressions.
- Move sensitive operations to controlled fail-closed semantics with fallback handling.

## Failure modes
- Network/API transient failures.
- Mis-scoped characteristics causing over-blocking.
- Incorrect proxy trust causing identity collapse.

## Response patterns
- Explicit fallback status codes and retry guidance.
- Alerting thresholds for deny spikes.

## Links
- https://docs.arcjet.com/reference/nodejs/
- https://docs.arcjet.com/shield/reference/
