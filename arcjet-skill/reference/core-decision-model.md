# Core Decision Model

Arcjet evaluates configured rules and returns a decision object.

## When To Use
- You need rule orchestration, deny handling, or rollout policy.

## Minimal pattern
```ts
import arcjet, { shield } from "@arcjet/node";

const aj = arcjet({ key: process.env.ARCJET_KEY!, rules: [shield({ mode: "DRY_RUN" })] });
const decision = await aj.protect(request);
if (decision.isDenied()) return new Response("Forbidden", { status: 403 });
```

## Key options
- `mode`: `DRY_RUN` or `LIVE`
- `rules`: ordered semantically, runtime may optimize execution
- `characteristics`: identity dimensions
- `proxies`: trusted proxy list for IP extraction

## Rollout
1. Start `DRY_RUN`.
2. Track reason breakdown and false positives.
3. Promote selected rules to `LIVE`.

## Links
- https://docs.arcjet.com/reference/nodejs/
- https://github.com/arcjet/arcjet-js
