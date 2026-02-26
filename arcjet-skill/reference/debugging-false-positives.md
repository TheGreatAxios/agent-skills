# Debugging False Positives

## Checklist
1. Reproduce with the same request context and headers.
2. Inspect decision reason and rule result stack.
3. Confirm identity characteristics and proxy IP extraction.
4. Adjust scope or switch to `DRY_RUN` while patching policy.

## Common causes
- Rule too broad on low-risk endpoints.
- Bot allowlist/denylist mismatch.
- Rate limit keyed by unstable identifiers.

## Links
- https://docs.arcjet.com/shield/reference/
- https://docs.arcjet.com/bot-protection/reference/
- https://docs.arcjet.com/rate-limiting/reference/
