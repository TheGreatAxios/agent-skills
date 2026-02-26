# Characteristics And Client Identity

Characteristics determine who quotas and decisions are keyed to.

## Use when
- You must enforce per-user, per-tenant, or per-key policies.

## Minimal example
```ts
const aj = arcjet({ key: process.env.ARCJET_KEY!, characteristics: ["user.id"], rules: [] });
```

## Production variant
- Mix stable identifiers: `user.id`, `tenant.id`, API key ID.
- Avoid transient fields that cause identity explosion.

## Links
- https://docs.arcjet.com/reference/nodejs/
- https://github.com/arcjet/arcjet-js/blob/main/CHANGELOG.md
