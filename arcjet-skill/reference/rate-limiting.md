# Rate Limiting

Algorithms: fixed window, sliding window, token bucket.

## Choose algorithm
- `fixedWindow`: simplest hard cap.
- `slidingWindow`: smoother at boundaries.
- `tokenBucket`: burst + refill control.

## Minimal example
```ts
import { tokenBucket } from "@arcjet/node";
const rule = tokenBucket({ mode: "LIVE", interval: "60s", refillRate: 20, capacity: 100 });
```

## Production variant
```ts
import { slidingWindow } from "@arcjet/node";
const rule = slidingWindow({ mode: "LIVE", interval: "1m", max: 120, characteristics: ["user.id"] });
```

## Common failure modes
- Tracking by IP for authenticated quotas that should be per-account.
- Capacity too low for bursty but valid users.

## Links
- https://docs.arcjet.com/rate-limiting/algorithms/
- https://docs.arcjet.com/rate-limiting/configuration
- https://docs.arcjet.com/rate-limiting/reference/
