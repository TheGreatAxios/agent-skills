# Filters And Custom Rules

Apply rule logic using request fields and conditions.

## Use when
- You need endpoint/tenant-specific controls.

## Pattern
- Build base client and attach conditional rules (`withRule`) per route.

## Minimal example
```ts
const scoped = aj.withRule(shield({ mode: "LIVE" }));
const decision = await scoped.protect(req);
```

## Links
- https://docs.arcjet.com/filters
- https://docs.arcjet.com/reference/nodejs/
- https://github.com/arcjet/arcjet-js/tree/main/examples
