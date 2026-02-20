# Rule: Record Validation

## Why It Matters

Records represent objects with dynamic keys but uniform value types. Use for dictionaries, maps, configuration objects, and key-value stores where keys aren't known at compile time.

## Basic Usage

```typescript
import { z } from "zod"

// String to string mapping
const StringRecord = z.record(z.string())

// String to number mapping
const NumberRecord = z.record(z.number())

// Type inference
type StringRecord = z.infer<typeof StringRecord> // Record<string, string>
```

## With Key Schema

```typescript
// Key type can be specified
const NumericKeys = z.record(z.number(), z.string())
// Keys must be number (or numeric string)

// Common pattern: string keys, object values
const UserRecord = z.record(z.object({
  name: z.string(),
  email: z.string().email()
}))

// Type inference
type UserRecord = z.infer<typeof UserRecord>
// Record<string, { name: string; email: string }>
```

## Record Types

| Type | Key Type | Value Type |
|------|----------|------------|
| `z.record(value)` | string | value schema |
| `z.record(key, value)` | key schema | value schema |

## z.partialRecord()

Keys and values are optional (may be undefined).

```typescript
const Partial = z.partialRecord(z.string(), z.number())

// Values can be undefined
Partial.parse({ a: 1, b: undefined, c: 3 }) // ✓
```

## z.looseRecord()

Allows any keys, validates only defined values.

```typescript
const Loose = z.looseRecord(z.number())

// Extra properties don't fail validation
Loose.parse({ a: 1, b: 2, extra: "ignored" }) // ✓
// Note: extra values still validated against value schema in practice
```

## Common Patterns

### Configuration Object

```typescript
const Config = z.record(z.union([
  z.string(),
  z.number(),
  z.boolean()
]))

// Parse env-like config
Config.parse({
  API_URL: "https://api.example.com",
  TIMEOUT: 5000,
  DEBUG: true
})
```

### Translations Dictionary

```typescript
const Translations = z.record(z.string())

// i18n translations
Translations.parse({
  "greeting": "Hello",
  "farewell": "Goodbye",
  "error.notFound": "Page not found"
})
```

### Feature Flags

```typescript
const FeatureFlags = z.record(z.boolean())

FeatureFlags.parse({
  enableNewUI: true,
  betaFeatures: false,
  experimental: true
})
```

### User Permissions Map

```typescript
const Permissions = z.record(z.enum(["read", "write", "admin"]))

Permissions.parse({
  "/users": "read",
  "/posts": "write",
  "/admin": "admin"
})
```

### Cache/Store

```typescript
const Cache = z.record(z.object({
  value: z.unknown(),
  expiresAt: z.number()
}))

// Timestamped cache entries
```

### Headers Object

```typescript
const Headers = z.record(z.string())

Headers.parse({
  "Content-Type": "application/json",
  "Authorization": "Bearer token"
})
```

### Counts/Metrics

```typescript
const Metrics = z.record(z.number().nonnegative())

Metrics.parse({
  pageViews: 1234,
  uniqueVisitors: 567,
  bounceRate: 0.25
})
```

## Key Validation

```typescript
// Keys must match pattern
const SlugRecord = z.record(
  z.string().regex(/^[a-z0-9-]+$/),
  z.string()
)

SlugRecord.parse({ "valid-slug": "value" }) // ✓
SlugRecord.parse({ "Invalid Slug": "value" }) // ✗ key fails
```

## Nested Records

```typescript
// Record of records
const Nested = z.record(z.record(z.number()))

// Multi-level config
Nested.parse({
  production: { port: 3000, workers: 4 },
  development: { port: 3001, workers: 1 }
})
```

## Record vs Object

| Feature | z.record() | z.object() |
|---------|------------|------------|
| Keys | Dynamic | Fixed |
| Values | Uniform type | Per-key types |
| Inference | `Record<K, V>` | Exact shape |
| Use case | Dictionaries | Structured data |

```typescript
// Use record for dynamic keys
const Counts = z.record(z.number())

// Use object for known structure
const User = z.object({
  id: z.string(),
  name: z.string()
})
```

## Transform Patterns

### To Map

```typescript
const ToMap = z.record(z.string())
  .transform(obj => new Map(Object.entries(obj)))
```

### To Entries

```typescript
const ToEntries = z.record(z.number())
  .transform(obj => Object.entries(obj))
// [string, number][]
```

### Filter Keys

```typescript
const FilteredRecord = z.record(z.number())
  .transform(obj => {
    const filtered: Record<string, number> = {}
    for (const [k, v] of Object.entries(obj)) {
      if (v > 0) filtered[k] = v
    }
    return filtered
  })
```

## Type Inference

```typescript
// Basic record
const Basic = z.record(z.string())
type Basic = z.infer<typeof Basic> // Record<string, string>

// With key type
const WithKey = z.record(z.number(), z.string())
type WithKey = z.infer<typeof WithKey> // Record<number, string>

// Complex value
const Complex = z.record(z.object({ id: z.string() }))
type Complex = z.infer<typeof Complex> // Record<string, { id: string }>
```

## Edge Cases

```typescript
// Empty object is valid
z.record(z.string()).parse({}) // ✓

// null/undefined fail
z.record(z.string()).parse(null) // ✗
z.record(z.string()).parse(undefined) // ✗

// Arrays don't pass
z.record(z.string()).parse([]) // ✗ (array is not object)

// Keys are always strings at runtime
const R = z.record(z.number(), z.string())
R.parse({ 1: "a" }) // ✓ Key "1" (string)
```

## Tips

1. **Use for dictionaries**: When keys are dynamic/runtime-determined
2. **Specify key type**: For additional key validation
3. **Consider Map for**: Complex key types or mutation
4. **Transform to Map**: For Map-specific operations
5. **Record vs object**: Records for uniform values, objects for structured data
