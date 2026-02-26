# Testing And Validation Playbook

## Required tests
- Routing: each user intent maps to correct reference file.
- Rule behavior: deny/allow path assertions for each control family.
- Rollout: `DRY_RUN` telemetry reviewed before `LIVE` switch.
- Link checks: internal references and canonical URLs verified.

## Scenario matrix
- Shield suspicious request simulations.
- Rate-limit boundary and burst tests.
- Bot category allow/deny tests.
- Sensitive info payload tests.
- Signup stack tests.

## Links
- https://docs.arcjet.com/
- https://docs.arcjet.com/llms.txt
- https://github.com/arcjet/arcjet-js/tree/main/examples
