---
name: arcjet
description: Arcjet security platform integration and operations guidance across all Arcjet docs domains and repositories. Use when implementing or tuning Shield WAF, rate limiting, bot protection, email validation, sensitive info controls, redaction, filters, characteristics, proxy/IP handling, SDK setup for Node/Next/Nest/Fastify/Remix/SvelteKit/Astro/Bun/Deno/Nuxt/React Router/Hono, Python coverage, and Arcjet blueprints for AI quota and abuse prevention.
---

# Arcjet Coverage Router

Use this skill as a router for full Arcjet docs-surface coverage.

## Execution Workflow

1. Identify runtime and framework.
2. Pick rules and mode (`DRY_RUN` first, then `LIVE`).
3. Define identity (`characteristics`) and proxy/IP trust boundaries.
4. Implement route/middleware guard with one shared Arcjet client/module.
5. Handle decision reasons explicitly in responses and logs.
6. Roll out progressively with sampling and false-positive review.

## Reference Routing Map

- Full docs map and coverage status: `reference/docs-index-map.md`
- Platforms and languages: `reference/platform-language-matrix.md`
- Core behavior and rule orchestration: `reference/core-decision-model.md`
- Shield: `reference/shield-waf.md`
- Rate limiting: `reference/rate-limiting.md`
- Bot protection: `reference/bot-protection.md`
- Email validation: `reference/email-validation.md`
- Sensitive info: `reference/sensitive-info.md`
- Redaction and LLM integrations: `reference/redaction-integrations.md`
- Signup/form hardening: `reference/signup-and-form-protection.md`
- Filters/custom rules: `reference/filters-and-custom-rules.md`
- Identity characteristics: `reference/characteristics-and-client-identity.md`
- Proxies and IP extraction: `reference/proxies-and-ip-resolution.md`
- SDK quickstarts by runtime: `reference/sdk-node.md` through `reference/sdk-nuxt-reactrouter-hono.md`
- Python and other repos: `reference/language-python-and-other-repos.md`
- Blueprints: `reference/blueprints-index.md` through `reference/blueprints-vpn-proxy-abuse-controls.md`
- Ops and troubleshooting: `reference/ops-rollout-observability.md` through `reference/testing-and-validation-playbook.md`

## Guardrails

- Keep one shared Arcjet instance per process.
- Prefer Arcjet docs and Arcjet GitHub as primary sources.
- Use `DRY_RUN` for rollout and policy validation.
- Load only the reference file needed for the current task.
- Start docs navigation from `https://docs.arcjet.com/llms.txt`.
