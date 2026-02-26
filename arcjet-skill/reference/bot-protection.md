# Bot Protection

Configure allowlist or denylist using known bots and categories.

## Minimal example
```ts
import { detectBot } from "@arcjet/node";
const rule = detectBot({ mode: "LIVE", allow: ["CATEGORY:SEARCH_ENGINE", "CURL"] });
```

## Production variant
```ts
const rule = detectBot({ mode: "LIVE", deny: ["CATEGORY:AI"] });
```

## Common failure modes
- Mixing `allow` and `deny` in same rule.
- Assuming all allowed bots are verified without checking status fields.

## Links
- https://docs.arcjet.com/bot-protection/reference/
- https://docs.arcjet.com/bot-protection/identifying-bots
- https://docs.arcjet.com/bot-protection/quick-start/
