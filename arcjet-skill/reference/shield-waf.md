# Shield WAF

Protect against suspicious request patterns over time.

## Use when
- You need OWASP-style attack pattern detection and probing defense.

## Minimal example
```ts
import { shield } from "@arcjet/node";
const rule = shield({ mode: "LIVE" });
```

## Production variant
```ts
const base = shield({ mode: "DRY_RUN" });
const strict = shield({ mode: "LIVE" }); // enable after baseline analysis
```

## Common failure modes
- Turning on `LIVE` globally before traffic profiling.
- Missing custom denial response path.

## Links
- https://docs.arcjet.com/shield/quick-start/
- https://docs.arcjet.com/shield/reference/
- https://docs.arcjet.com/shield/concepts
- https://github.com/arcjet/arcjet-js/tree/main/examples
