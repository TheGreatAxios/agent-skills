# Proxies And IP Resolution

Set trusted proxies so Arcjet derives correct client IP.

## Minimal example
```ts
const aj = arcjet({ key: process.env.ARCJET_KEY!, proxies: ["10.0.0.0/8"], rules: [] });
```

## Production variant
- Maintain CIDR allowlist for load balancers and edge gateways.
- Revalidate after infra/network changes.

## Links
- https://docs.arcjet.com/reference/nodejs/
- https://docs.arcjet.com/reference/nextjs
- https://github.com/arcjet/arcjet-js
